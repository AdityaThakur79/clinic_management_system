import express from 'express';
import {
  createBlog,
  listBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getPublicBlogs,
  getRelatedBlogs,
  getFeaturedBlogs,
  getPopularBlogs,
  incrementBlogLikes
} from '../controllers/blog.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import upload from '../utils/common/Uploads.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicBlogs);
router.get('/public/featured', getFeaturedBlogs);
router.get('/public/popular', getPopularBlogs);
router.get('/public/slug/:slug', getBlogBySlug);
router.get('/public/:id/related', getRelatedBlogs);
router.post('/public/:id/like', incrementBlogLikes);

// Protected routes (authentication required)
router.post('/', isAuthenticated, upload, createBlog);
router.get('/', isAuthenticated, listBlogs);
router.get('/:id', isAuthenticated, getBlogById);
router.put('/:id', isAuthenticated, upload, updateBlog);
router.delete('/:id', isAuthenticated, deleteBlog);

export default router;
