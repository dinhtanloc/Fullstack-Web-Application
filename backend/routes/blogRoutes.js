import express from 'express';
import { getBlogs, createBlog } from '../controllers/postsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getBlogs);
router.post('/', protect, createBlog);

export default router;
