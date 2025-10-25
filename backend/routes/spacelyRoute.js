import { Router } from 'express';
import { generateTwoPointPerspective } from '../controllers/spacelyController.js';

const router = Router();

router.post('/two-point-perspective', generateTwoPointPerspective);

export default router;
