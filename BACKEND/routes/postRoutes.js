import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import postController from '../controllers/postControllers.js';
import upload from '../controllers/upload.js';
import { toggleLike, addComment } from '../controllers/postControllers.js';
const router = express.Router();
router.post('/' , authMiddleware , upload.single('image') , postController.createPost);
router.get('/' , authMiddleware , postController.getAllPosts);
router.put('/:id/like', authMiddleware, toggleLike);
router.post('/:id/comment', authMiddleware, addComment);

export default router;