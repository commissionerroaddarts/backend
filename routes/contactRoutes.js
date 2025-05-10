import express from 'express';
import { createContact, getAllContacts } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);       // POST /api/contactus
router.get('/', getAllContacts);       // GET /api/contactus

export default router;
