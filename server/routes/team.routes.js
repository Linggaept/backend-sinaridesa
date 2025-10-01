const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authMiddleware = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/upload');

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
 *     summary: Get all team members
 *     tags: [Team]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: A list of team members
 *   post:
 *     summary: Create a new team member
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
 */
router.route('/')
  .get(teamController.getAllTeamMembers)
  .post(authMiddleware, uploadImage.single('picture'), teamController.createTeamMember);

/**
 * @swagger
 * /team/{id}:
 *   get:
 *     summary: Get a team member by ID
 *     tags: [Team]
 *     security:
 *       - ApiKeyAuth: []
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
 *   put:
 *     summary: Update a team member
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
 *       404:
 *         description: Team member not found
 *   delete:
 *     summary: Delete a team member
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
 *       404:
 *         description: Team member not found
 */
router.route('/:id')
  .get(teamController.getTeamMemberById)
  .put(authMiddleware, uploadImage.single('picture'), teamController.updateTeamMember)
  .delete(authMiddleware, teamController.deleteTeamMember);

module.exports = router;
