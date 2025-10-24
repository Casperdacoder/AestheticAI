import { Router } from "express";
import multer from "multer";
import { analyzeRoom } from "../controllers/analyzeController.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), analyzeRoom);

export default router;
