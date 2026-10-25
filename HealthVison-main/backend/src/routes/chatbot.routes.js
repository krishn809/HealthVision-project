import express from 'express';
import { 
    sendMessage, 
    getHistory, 
    getReportConversations, 
    deleteMessage 
} from '../controllers/chatbot.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /chatbot/message:
 *   post:
 *     summary: Send a message to the chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               reportId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chatbot response
 */
router.post('/message', protect, sendMessage);

/**
 * @swagger
 * /chatbot/history:
 *   get:
 *     summary: Get chat history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat history
 */
router.get('/history', protect, getHistory);

/**
 * @swagger
 * /chatbot/report/{reportId}:
 *   get:
 *     summary: Get chat conversations related to a specific report
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related conversations retrieved
 */
router.get('/report/:reportId', protect, getReportConversations);

/**
 * @swagger
 * /chatbot/message/{messageId}:
 *   delete:
 *     summary: Delete a chat message
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/message/:messageId', protect, deleteMessage);

export default router;
