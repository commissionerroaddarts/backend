import express from 'express';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { createReview, getAllReviews, deleteReview, bulkCreateReviews, updateReview } from '../controllers/reviewsController.js';
import { validateCreateReview, validateUpdateReview } from '../validation/reviewValidation.js';

const router = express.Router();

router.post('/', authMiddleware, validateCreateReview, createReview);
router.post('/bulk', bulkCreateReviews);
// router.get('/:business', authMiddleware, getAllReviews);
router.get('/', authMiddleware, getAllReviews);
router.delete('/:id', authMiddleware, deleteReview);
router.patch('/:id', authMiddleware, validateUpdateReview, updateReview);

export default router;
