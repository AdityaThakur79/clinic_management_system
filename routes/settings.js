import express from 'express';
import {
  getSettings,
  updateSettings,
  updateSpecificSetting
} from '../controllers/settings.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import upload from '../utils/common/Uploads.js';

const router = express.Router();
// Get settings
router.get('/',getSettings);

// Update all settings (SuperAdmin only)
router.put('/', isAuthenticated, isSuperAdmin, upload, updateSettings);

// Update specific setting (SuperAdmin only)
router.patch('/', isAuthenticated, isSuperAdmin, updateSpecificSetting);

export default router;
