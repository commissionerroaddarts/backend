import express from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    bulkCreateEvents,
    uploadEventImage,
    uploadEventBanner,
    addInterest,
    getInterestedPeopleByEventId,
    uploadEventMedia
} from '../controllers/eventController.js';

import upload from '../middlewares/uploadMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateCreateEvent, validateUpdateEvent } from '../validation/eventValidation.js';

const router = express.Router();

const uploadMedia = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'banner', maxCount: 1 }
]);

// CRUD Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/bulk', authMiddleware, bulkCreateEvents);
router.patch('/media/:id', authMiddleware,uploadMedia, uploadEventMedia);
router.post('/', authMiddleware, uploadMedia, validateCreateEvent, createEvent);
router.patch('/:id', authMiddleware, validateUpdateEvent, updateEvent);
// router.patch('/upload-banner/:id', authMiddleware, upload.single('banner'), uploadEventBanner);
// router.patch('/upload-image/:id', authMiddleware, upload.single('images'), uploadEventImage);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/interested/:id', authMiddleware, addInterest);
router.get('/interested/:id', getInterestedPeopleByEventId);

export default router;
