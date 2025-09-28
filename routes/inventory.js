import express from 'express';
import {
  createInventory,
  listInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  updateStock,
  getInventoryAnalytics,
  checkInventoryThresholds,
  sendInventoryAlerts
} from '../controllers/inventory.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import upload from '../utils/common/Uploads.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create inventory - SuperAdmin only
router.post('/', upload, createInventory);

// List inventories
router.get('/', listInventories);

// Get inventory analytics - SuperAdmin only
router.get('/analytics',  getInventoryAnalytics);

// Check inventory thresholds
router.get('/thresholds/check', checkInventoryThresholds);

// Send inventory alerts
router.post('/thresholds/alerts', sendInventoryAlerts);

// Update stock - SuperAdmin only (must come before /:id route)
router.patch('/:id/stock',  updateStock);

// Get single inventory
router.get('/:id', getInventoryById);

// Update inventory - All authenticated users (role-based logic in controller)
router.put('/:id', upload, updateInventory);

// Delete inventory - SuperAdmin only
router.delete('/:id', deleteInventory);

export default router;

