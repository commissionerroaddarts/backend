import express from 'express';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  bulkCreateBusinesses,
  uploadBusinessLogo,
  uploadBusinessImage,
  uploadBusinessMedia,
  deleteBusinessMedia,
  sendMessageToOwner
} from '../controllers/businessController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import { validateCreate, validateUpdate } from '../validation/businessValidation.js';

const router = express.Router();

const uploadMedia = upload.fields([
  { name: 'images', maxCount: 10 },  // for multiple images
  { name: 'businessLogo', maxCount: 1 },  // for a single logo
  { name: 'businessCover', maxCount: 1 },  
  
]);

// CRUD Routes
router.get('/', getAllBusinesses);
router.get('/:id', getBusinessById);
router.post('/bulk', authMiddleware, bulkCreateBusinesses);
router.patch('/media/:id', authMiddleware,uploadMedia, uploadBusinessMedia);
router.post('/', authMiddleware, uploadMedia, validateCreate, createBusiness);
router.patch('/:id', authMiddleware, validateUpdate, updateBusiness);
// router.patch('/upload-logo/:id', authMiddleware, upload.single('businessLogo'), uploadBusinessLogo);
router.patch('/upload/:id', authMiddleware, uploadMedia, uploadBusinessImage);
router.delete('/:id', authMiddleware, deleteBusiness);
router.delete('/media/:id', authMiddleware, deleteBusinessMedia);

router.post('/contact/:id', sendMessageToOwner);


export default router;
