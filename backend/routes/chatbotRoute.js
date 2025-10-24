import { Router } from "express";
import { chatWithAI } from "../controllers/chatbotController.js";

const router = Router();

router.post("/", chatWithAI);

export default router;
