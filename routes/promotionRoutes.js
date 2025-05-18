import express from 'express';
import {
    deletePromotion,
    upsertPromotion,
} from '../controllers/businessController.js';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { validatePromotion } from '../validation/promotionValidation.js';

const router = express.Router();

// CRUD Routes
router.post('/:id', authMiddleware, validatePromotion, upsertPromotion);
router.delete('/:id', authMiddleware, deletePromotion);

export default router;
