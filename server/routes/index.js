const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const teamRoutes = require('./team.routes');
const eventRoutes = require('./event.routes');
const dashboardRoutes = require('./dashboard.routes');
const certificateRoutes = require('./certificate.routes');
const chatRoutes = require('./chat.routes');
const exportRoutes = require('./export.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/team', teamRoutes);
router.use('/events', eventRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/certificates', certificateRoutes);
router.use('/chat', chatRoutes);
router.use('/', exportRoutes);

module.exports = router;