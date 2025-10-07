const express = require('express');
const router = express.Router();
const { startNewChat, continueChat, getChatHistoryBySlug, getAllChatHistories } = require('../controllers/chat.controller');
const { optionalAuthenticateToken, authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chatbot using Gemini API
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Start a new chat session
 *     tags: [Chatbot]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
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
 *                 description: The first message of the new chat.
 *     responses:
 *       201:
 *         description: New chat started successfully. Returns the first response, the new slug, and a token for unauthenticated users.
 *       400:
 *         description: Bad request
 */
router.post('/', optionalAuthenticateToken, startNewChat);

/**
 * @swagger
 * /chat/{slug}:
 *   post:
 *     summary: Continue an existing chat session
 *     tags: [Chatbot]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the chat history to continue.
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
 *                 description: The user's message.
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Chat history not found
 *       429:
 *         description: Message limit reached for unauthenticated users
 */
router.post('/:slug', optionalAuthenticateToken, continueChat);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Get all chat histories (Admin only)
 *     tags: [Chatbot]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all chat histories.
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authenticateToken, getAllChatHistories);

/**
 * @swagger
 * /chat/history/{slug}:
 *   get:
 *     summary: Get a specific chat history by its slug
 *     tags: [Chatbot]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the chat history.
 *     responses:
 *       200:
 *         description: The requested chat history.
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Chat history not found
 */
router.get('/history/:slug', optionalAuthenticateToken, getChatHistoryBySlug);

module.exports = router;