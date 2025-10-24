import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-your-real-key-here",
});

export const suggestDesign = async (req, res) => {
  const { objects = [], colors = [], preferences = {} } = req.body || {};

  const prompt =
    "You are an interior designer AI. Based on these detected items: " +
    JSON.stringify(objects) +
    ", dominant colors: " +
    JSON.stringify(colors) +
    ", and user preferences: " +
    JSON.stringify(preferences) +
    ", provide layout arrangement, furniture repositioning, and wall paint color suggestions.";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices?.[0]?.message?.content ?? "";

    return res.json({ success: true, suggestions: content });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
