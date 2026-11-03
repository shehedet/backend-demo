import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPost, listPosts, getPost, updatePost, deletePost } from '../controllers/postController.js';
import { getUserPosts } from '../controllers/aggregationController.js';

const router = Router();

router.get('/', listPosts);
router.get('/:id', getPost);

router.post('/', authenticate, createPost);
router.get('/user/:userId', getUserPosts);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;