import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyzeRoute.js";
import suggestRoute from "./routes/suggestRoute.js";
import chatbotRoute from "./routes/chatbotRoute.js";
import huggingfaceRoute from "./routes/huggingfaceRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/analyze", analyzeRoute);
app.use("/api/suggest", suggestRoute);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/hf", huggingfaceRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("AestheticAI backend running on port " + PORT);
});
