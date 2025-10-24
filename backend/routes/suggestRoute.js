import { Router } from "express";
import { suggestDesign } from "../controllers/suggestController.js";

const router = Router();

router.post("/", suggestDesign);

export default router;
