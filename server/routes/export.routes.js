const express = require("express");
const router = express.Router();
const { exportDatabase } = require("../controllers/export.controller");
const { authenticateToken, isAdmin } = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Database export
 */

/**
 * @swagger
 * /export:
 *   get:
 *     summary: Export database
 *     tags: [Export]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Database exported successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database export failed
 */
router.get("/export", [authenticateToken, isAdmin], exportDatabase);

module.exports = router;
