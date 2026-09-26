import express from 'express';
import { getMessages , sendMessage , getConversations } from '../controllers/messageControllers.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.get('/conversations' , authMiddleware , getConversations);
router.get('/:otherUserId' , authMiddleware , getMessages);
router.post('/:recipientId' , authMiddleware , sendMessage);
export default router;