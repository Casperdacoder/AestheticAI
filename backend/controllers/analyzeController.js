import fs from "fs";
import { Vibrant } from "node-vibrant/node";
import vision from "@google-cloud/vision";

const visionClient = new vision.ImageAnnotatorClient();

function toHex(rgbArr) {
  const [r,g,b] = rgbArr.map(n => Math.max(0, Math.min(255, Math.round(n))));
  return "#" + [r,g,b].map(x => x.toString(16).padStart(2,"0")).join("");
}

export const analyzeRoom = async (req, res) => {
  const imgPath = req.file?.path;
  if (!imgPath) return res.status(400).json({ success:false, error:"No image provided" });

  try {
    // 1) Google Vision object detection (Node SDK)
    const [result] = await visionClient.objectLocalization({ image: { source: { filename: imgPath } } });
    const objects = (result.localizedObjectAnnotations || []).map(o => ({
      name: o.name,
      confidence: Number(o.score || 0)
    }));

    // 2) Dominant colors via Vibrant
    const palette = await Vibrant.from(imgPath, { useImageWorker: false }).getPalette();
    const colors = Object.values(palette)
      .filter(Boolean)
      .map(swatch => toHex(swatch.rgb))
      .slice(0,5);

    // cleanup temp file
    try { fs.unlinkSync(imgPath); } catch(_) {}

    return res.json({ success:true, objects, colors });
  } catch (e) {
    try { fs.unlinkSync(imgPath); } catch(_) {}
    return res.status(500).json({ success:false, error:e.message });
  }
};
