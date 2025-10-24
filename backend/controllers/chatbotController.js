import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-your-real-key-here",
});

export const chatWithAI = async (req, res) => {
  const { message = "", userTier = "free" } = req.body || {};

  const limitNote =
    userTier === "free"
      ? "You can make 5 edits only. Keep responses concise."
      : "You can make unlimited customizations.";

  const prompt =
    'You are AestheticAI, an interior design assistant chatbot.\n' +
    `User tier note: ${limitNote}.\n` +
    `User message: "${message}".\n` +
    "Provide updated design suggestions or new layout modifications.";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.choices?.[0]?.message?.content ?? "";

    return res.json({ success: true, reply });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
