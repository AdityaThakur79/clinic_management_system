import express from 'express';
const router = express.Router();
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  addNoteToEnquiry,
  deleteEnquiry,
  getEnquiryStats
} from '../controllers/enquiry.js';
import {isAuthenticated} from '../middlewares/isAuthenticated.js';
import {isSuperAdmin} from '../middlewares/isSuperAdmin.js';

// Public routes
router.post('/create', createEnquiry);

// Protected routes - require authentication
router.get('/all', isAuthenticated, getAllEnquiries);
router.get('/stats', isAuthenticated, getEnquiryStats);
router.get('/:id', isAuthenticated, getEnquiryById);
router.put('/:id', isAuthenticated, updateEnquiry);
router.post('/:id/notes', isAuthenticated, addNoteToEnquiry);

// Admin only routes
router.delete('/:id', isAuthenticated, isSuperAdmin, deleteEnquiry);

export default router;
