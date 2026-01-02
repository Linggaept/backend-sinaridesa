const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { uploadCourseFiles } = require('../middlewares/upload');
const compressImage = require('../middlewares/compressImage');
const { query } = require('express-validator');

const courseUpload = uploadCourseFiles.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'coursePdf', maxCount: 1 },
]);

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses with pagination and search
 *     tags: [Courses]
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
 *         description: Search term for course title or description
 *     responses:
 *       200:
 *         description: A list of courses
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
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
 *               - uploader
 *             properties:
 *               title:
 *                 type: string
 *               uploader:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               coursePdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: 
 *         description: Course created successfully
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
    courseController.getAllCourses
  )
  .post(authenticateToken, isAdmin, courseUpload, compressImage, courseController.createCourse);

/**
 * @swagger
 * /courses/slug/{slug}:
 *   get:
 *     summary: Get a course by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The course slug
 *     responses:
 *       200:
 *         description: Course data
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.route('/slug/:slug').get(courseController.getCourseBySlug);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course data
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               uploader:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 *   delete:
 *     summary: Delete a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
router.route('/:id')
  .get(courseController.getCourseById)
  .put(authenticateToken, isAdmin, courseUpload, compressImage, courseController.updateCourse)
  .delete(authenticateToken, isAdmin, courseController.deleteCourse);

module.exports = router;