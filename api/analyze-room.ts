import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

type WindowBox = { x: number; y: number; w: number; h: number };
type AnalyzeOut = {
  roomType: string | null;
  roomConfidence: number;
  hasWindow: boolean;
  windowConfidence: number;
  windowBoxes: WindowBox[];
};

const ROOM_SET = ['bedroom', 'kitchen', 'living room', 'bathroom', 'dining room', 'office'];

const AZ_FEATURES = 'tags,objects,caption,denseCaptions';
const AZ_VERSION = '2023-02-01-preview';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'POST only' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { url, base64, mimeType } = body || {};

    if (!url && !base64) {
      return res.status(400).json({ error: 'Provide an image url or base64 data.' });
    }

    const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
    const azureKey = process.env.AZURE_VISION_KEY;
    if (!azureEndpoint || !azureKey) {
      return res.status(500).json({ error: 'Azure Vision is not configured.' });
    }

    let effectiveMime = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg';
    let imageBuffer: Buffer | null = null;

    if (typeof base64 === 'string' && base64.trim()) {
      const dataUrlMatch = base64.match(/^data:(.+?);base64,(.+)$/i);
      let rawBase64 = base64.trim();
      if (dataUrlMatch) {
        effectiveMime = mimeType || dataUrlMatch[1] || effectiveMime;
        rawBase64 = dataUrlMatch[2];
      }
      try {
        imageBuffer = Buffer.from(rawBase64, 'base64');
      } catch (error) {
        return res.status(400).json({ error: 'Invalid base64 image payload.' });
      }
    }

    const azHeaders: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': azureKey
    };
    let azBody: BodyInit;

    if (imageBuffer) {
      azHeaders['Content-Type'] = 'application/octet-stream';
      azBody = imageBuffer;
    } else {
      azHeaders['Content-Type'] = 'application/json';
      azBody = JSON.stringify({ url });
    }

    const azResponse = await fetch(
      `${azureEndpoint}/computervision/imageanalysis:analyze?features=${AZ_FEATURES}&api-version=${AZ_VERSION}`,
      {
        method: 'POST',
        headers: azHeaders,
        body: azBody
      }
    );

    if (!azResponse.ok) {
      const detail = await azResponse.text();
      return res
        .status(azResponse.status)
        .json({ error: detail || `Azure Vision request failed (${azResponse.status})` });
    }

    const az = await azResponse.json();

    let roomAZ: string | null = null;
    let confAZ = 0;
    let hasWindowAZ = false;
    let winConfAZ = 0;
    const windowBoxes: WindowBox[] = [];

    const tags = az?.tags?.values ?? [];
    const objects = az?.objects?.values ?? [];
    const denseCaptions = (az?.denseCaptions?.values ?? [])
      .map((c: any) => c?.text || '')
      .join(' ')
      .toLowerCase();

    for (const t of tags) {
      const name = (t?.name || '').toLowerCase();
      const conf = Number(t?.confidence || 0);
      if (ROOM_SET.includes(name) && conf > confAZ) {
        roomAZ = name;
        confAZ = conf;
      }
      if (name === 'window' && conf > winConfAZ) {
        hasWindowAZ = true;
        winConfAZ = conf;
      }
    }

    for (const o of objects) {
      const name = (o?.name || '').toLowerCase();
      const conf = Number(o?.confidence || 0);
      if (name === 'window' && conf > winConfAZ) {
        hasWindowAZ = true;
        winConfAZ = conf;
        const b = o?.boundingBox;
        if (b) {
          windowBoxes.push({ x: b.x, y: b.y, w: b.w, h: b.h });
        }
      }
    }

    if (!hasWindowAZ && denseCaptions.includes('window')) {
      hasWindowAZ = true;
      winConfAZ = Math.max(winConfAZ, 0.5);
    }

    let roomFinal = roomAZ;
    let confFinal = confAZ;

    if ((confAZ || 0) < 0.8 && process.env.HF_TOKEN) {
      try {
        let hf;
        if (imageBuffer) {
          const hfResponse = await fetch(
            'https://api-inference.huggingface.co/models/zhoubolei/places365-resnet50',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': effectiveMime || 'application/octet-stream',
                Accept: 'application/json'
              },
              body: imageBuffer
            }
          );
          if (!hfResponse.ok) {
            const detail = await hfResponse.text();
            throw new Error(detail || `HF fallback failed (${hfResponse.status})`);
          }
          hf = await hfResponse.json();
        } else {
          const hfResponse = await fetch(
            'https://api-inference.huggingface.co/models/zhoubolei/places365-resnet50',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ inputs: url })
            }
          );
          if (!hfResponse.ok) {
            const detail = await hfResponse.text();
            throw new Error(detail || `HF fallback failed (${hfResponse.status})`);
          }
          hf = await hfResponse.json();
        }

        let roomSC: string | null = null;
        let confSC = 0;
        for (const row of hf?.[0] ?? []) {
          const label = (row?.label || '').toLowerCase();
          const score = Number(row?.score || 0);
          for (const target of ROOM_SET) {
            if (label.includes(target) && score > confSC) {
              roomSC = target;
              confSC = score;
            }
          }
        }
        if ((confSC || 0) > (confAZ || 0)) {
          roomFinal = roomSC ?? roomAZ;
          confFinal = Math.max(confAZ || 0, confSC || 0);
        }
      } catch (error: any) {
        console.warn('[analyze-room] Hugging Face fallback failed:', error?.message || error);
      }
    }

    const payload: AnalyzeOut = {
      roomType: roomFinal ?? null,
      roomConfidence: Number(confFinal.toFixed(3)),
      hasWindow: hasWindowAZ,
      windowConfidence: Number(winConfAZ.toFixed(3)),
      windowBoxes
    };

    return res.status(200).json(payload);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
}
