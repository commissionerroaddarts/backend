import express from 'express';
import { getAllUsers, getUser, updateProfileImage, updateUser } from './../controllers/userConstoller.js';
import { authMiddleware } from './../middlewares/authMiddleware.js';
import upload from './../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/', authMiddleware, updateUser);
router.patch('/update-profile-img', authMiddleware, upload.single('profileImg'), updateProfileImage);
// router.delete('/:id',authMiddleware, deleteUser);

export default router;