import axios from "axios";

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN || process.env.HF_API_KEY;
const HF_IMAGE_MODEL =
  process.env.HUGGINGFACE_IMAGE_MODEL || "Salesforce/blip-image-captioning-base";
const HF_TEXT_MODEL =
  process.env.HUGGINGFACE_TEXT_MODEL || "HuggingFaceH4/zephyr-7b-beta";

const HF_BASE_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_IMAGE_MIME = "image/jpeg";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeBase64(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.startsWith("data:")) {
    const [, data] = trimmed.split(",");
    return data || null;
  }
  return trimmed;
}

function extractGeneratedText(payload) {
  if (!payload) return null;
  if (typeof payload === "string") {
    return payload;
  }
  if (Array.isArray(payload)) {
    return (
      payload[0]?.generated_text ||
      payload[0]?.text ||
      payload[0]?.output ||
      null
    );
  }
  return (
    payload.generated_text ||
    payload.text ||
    payload?.choices?.[0]?.text ||
    payload?.data?.[0]?.generated_text ||
    null
  );
}

function parseJsonFromText(text) {
  if (!text) return null;
  try {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```json([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1]);
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
  } catch (error) {
    console.warn("[huggingface] Failed to parse JSON plan", error.message);
  }
  return null;
}

function buildDesignPrompt({ prompt, caption, roomType, measurements }) {
  const lines = [
    "You are an interior design assistant that must reply with strict JSON.",
    'JSON schema: {"styleName":string,"styleSummary":string,"colorPalette":string[3-6],"layoutIdeas":[{"room":string,"summary":string}],"decorTips":string[3-6],"furnitureSuggestions":string[3-6],"photoInsights":{"observations":string[0-6],"recommendedLighting":string|null}}',
    "",
    `User prompt: ${prompt?.trim() || "Not provided"}.`,
  ];

  if (roomType) {
    lines.push(`Room type: ${roomType}.`);
  }

  if (caption) {
    lines.push(`Photo caption: ${caption}.`);
  }

  if (measurements) {
    lines.push(`Measurements: ${JSON.stringify(measurements)}.`);
  }

  lines.push("Return only JSON with double quoted keys.");
  return lines.join("\n");
}

async function invokeModel(model, payload, attempt = 0) {
  try {
    const { data } = await axios.post(`${HF_BASE_URL}/${model}`, payload, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: Number(process.env.HUGGINGFACE_TIMEOUT || 60000),
    });

    return data;
  } catch (error) {
    const status = error.response?.status;
    if ((status === 503 || status === 429) && attempt < 3) {
      await wait(800 * (attempt + 1));
      return invokeModel(model, payload, attempt + 1);
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Hugging Face request failed";

    const err = new Error(message);
    err.status = status || 500;
    throw err;
  }
}

export const generateLayoutFromPhoto = async (req, res) => {
  if (!HF_TOKEN) {
    return res.status(500).json({
      success: false,
      error:
        "Missing HUGGINGFACE_TOKEN environment variable. Please add it to your backend .env file.",
    });
  }

  const {
    prompt = "",
    roomType = null,
    measurements = null,
    imageBase64 = null,
    imageMimeType = DEFAULT_IMAGE_MIME,
  } = req.body || {};

  const normalizedBase64 = normalizeBase64(imageBase64);

  try {
    let caption = null;

    if (normalizedBase64) {
      const payload = {
        inputs: `data:${imageMimeType || DEFAULT_IMAGE_MIME};base64,${normalizedBase64}`,
        options: { wait_for_model: true },
      };
      const imageResponse = await invokeModel(HF_IMAGE_MODEL, payload);
      caption = extractGeneratedText(imageResponse);
    }

    const designPrompt = buildDesignPrompt({
      prompt,
      caption,
      roomType,
      measurements,
    });

    const textPayload = {
      inputs: designPrompt,
      parameters: {
        temperature: 0.5,
        top_p: 0.92,
        max_new_tokens: 420,
        return_full_text: false,
      },
      options: { wait_for_model: true },
    };

    const textResponse = await invokeModel(HF_TEXT_MODEL, textPayload);
    const generatedText = extractGeneratedText(textResponse);
    const planJson = parseJsonFromText(generatedText);

    if (!planJson) {
      return res.status(200).json({
        success: true,
        model: {
          image: HF_IMAGE_MODEL,
          text: HF_TEXT_MODEL,
        },
        caption,
        plan: null,
        raw: generatedText,
        warning:
          "Model response did not contain valid JSON. See `raw` field for the full output.",
      });
    }

    return res.json({
      success: true,
      model: {
        image: HF_IMAGE_MODEL,
        text: HF_TEXT_MODEL,
      },
      caption,
      plan: planJson,
      raw: generatedText,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || "Failed to generate layout suggestions.",
    });
  }
};
