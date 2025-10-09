const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { uploadEventFiles } = require('../middlewares/upload');
const compressImage = require('../middlewares/compressImage');
const { query } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

const eventUploads = uploadEventFiles.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with pagination and search
 *     tags: [Events]
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
 *         description: Search term for event title or description
 *     responses:
 *       200:
 *         description: A list of events
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
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
 *               - title
 *               - date
 *               - location
 *               - participants
 *               - thumbnail
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               participants:
 *                 type: integer
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
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
    eventController.getAllEvents
  )
  .post(authenticateToken, isAdmin, eventUploads, compressImage, eventController.createEvent);

/**
 * @swagger
 * /events/slug/{slug}:
 *   get:
 *     summary: Get an event by slug
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The event slug
 *     responses:
 *       200:
 *         description: Event data
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 */
router.route('/slug/:slug').get(eventController.getEventBySlug);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event data
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The event ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               participants:
 *                 type: integer
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.route('/:id')
  .get(eventController.getEventById)
  .put(authenticateToken, isAdmin, eventUploads, compressImage, eventController.updateEvent)
  .delete(authenticateToken, isAdmin, eventController.deleteEvent);

module.exports = router;