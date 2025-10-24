import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyzeRoute.js";
import suggestRoute from "./routes/suggestRoute.js";
import chatbotRoute from "./routes/chatbotRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/analyze", analyzeRoute);
app.use("/api/suggest", suggestRoute);
app.use("/api/chatbot", chatbotRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("AestheticAI backend running on port " + PORT);
});
