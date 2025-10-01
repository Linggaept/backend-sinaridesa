const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth');
const { uploadImage, uploadPdf } = require('../middlewares/upload');

const courseUpload = uploadImage.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'coursePdf', maxCount: 1 },
]);

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes
router.post('/', authMiddleware, courseUpload, courseController.createCourse);
router.put('/:id', authMiddleware, uploadImage.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);

module.exports = router;
