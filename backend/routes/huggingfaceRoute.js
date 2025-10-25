import { Router } from "express";
import { generateLayoutFromPhoto } from "../controllers/huggingfaceController.js";

const router = Router();

router.post("/layout", generateLayoutFromPhoto);

export default router;
