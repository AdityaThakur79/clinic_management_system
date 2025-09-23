import express from 'express';
import {
  createInventory,
  listInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  updateStock,
  getInventoryAnalytics
} from '../controllers/inventory.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create inventory - SuperAdmin only
router.post('/', createInventory);

// List inventories
router.get('/', listInventories);

// Get inventory analytics - SuperAdmin only
router.get('/analytics',  getInventoryAnalytics);

// Update stock - SuperAdmin only (must come before /:id route)
router.patch('/:id/stock',  updateStock);

// Get single inventory
router.get('/:id', getInventoryById);

// Update inventory - SuperAdmin only
router.put('/:id', updateInventory);

// Delete inventory - SuperAdmin only
router.delete('/:id', deleteInventory);

export default router;

