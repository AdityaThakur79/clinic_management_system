import express from 'express';
import { getAllBills, getBillByAppointment, getBillById } from '../controllers/bill.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.get('/', isAuthenticated, getAllBills);
router.get('/appointment/:appointmentId', isAuthenticated, getBillByAppointment);
router.get('/:id', isAuthenticated, getBillById);

export default router;


