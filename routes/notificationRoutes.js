import express from 'express';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { getUsersNotification, markNotificationsAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authMiddleware, getUsersNotification);

router.put('/mark-read', authMiddleware, markNotificationsAsRead);

export default router;
