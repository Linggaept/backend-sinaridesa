const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const teamRoutes = require('./team.routes');
const eventRoutes = require('./event.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/team', teamRoutes);
router.use('/events', eventRoutes);

module.exports = router;
