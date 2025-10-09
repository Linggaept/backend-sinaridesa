const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/upload');
const compressImage = require('../middlewares/compressImage');
const { query } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team management
 */

/**
 * @swagger
 * /team:
 *   get:
 *     summary: Get all team members with pagination and search
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for team members
 *     responses:
 *       200:
 *         description: A list of team members
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new team member (Admin only)
 *     tags: [Team]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               position:
 *                 type: string
 *                 enum: [MENTOR, SINARIDESA_TEAM]
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Team member created successfully
 *       403:
 *         description: Forbidden
 */
router.route('/')
  .get(
    [
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1 }).toInt(),
      query('search').optional().isString().escape(),
    ],
    teamController.getAllTeamMembers
  )
  .post(authenticateToken, isAdmin, uploadImage.single('picture'), compressImage, teamController.createTeamMember);

/**
 * @swagger
 * /team/{id}:
 *   get:
 *     summary: Get a team member by ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team member ID
 *     responses:
 *       200:
 *         description: Team member data
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update a team member (Admin only)
 *     tags: [Team]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team member ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               position:
 *                 type: string
 *                 enum: [MENTOR, SINARIDESA_TEAM]
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team member not found
 *   delete:
 *     summary: Delete a team member (Admin only)
 *     tags: [Team]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The team member ID
 *     responses:
 *       200:
 *         description: Team member deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team member not found
 */
router.route('/:id')
  .get(teamController.getTeamMemberById)
  .put(authenticateToken, isAdmin, uploadImage.single('picture'), compressImage, teamController.updateTeamMember)
  .delete(authenticateToken, isAdmin, teamController.deleteTeamMember);

module.exports = router;