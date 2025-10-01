const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authMiddleware = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/upload');

// Public routes
router.get('/', teamController.getAllTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Protected routes
router.post('/', authMiddleware, uploadImage.single('picture'), teamController.createTeamMember);
router.put('/:id', authMiddleware, uploadImage.single('picture'), teamController.updateTeamMember);
router.delete('/:id', authMiddleware, teamController.deleteTeamMember);

module.exports = router;
