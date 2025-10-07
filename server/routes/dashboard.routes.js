const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get statistics for the dashboard
 *     tags: [Dashboard]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

module.exports = router;