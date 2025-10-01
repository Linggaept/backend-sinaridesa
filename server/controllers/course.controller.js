const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

// Create a new course
const createCourse = async (req, res) => {
  const { title, uploader, description } = req.body;
  const authorId = req.user.userId;

  if (!title || !uploader) {
    return res.status(400).json({
      status: 'fail',
      message: 'Title and uploader are required.',
    });
  }

  try {
    // Verify the user exists before creating the course
    const user = await prisma.user.findUnique({ where: { id: authorId } });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized: User not found.',
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        uploader,
        description,
        authorId,
        filePath: req.files.coursePdf ? req.files.coursePdf[0].path : null,
        thumbnail: req.files.thumbnail ? req.files.thumbnail[0].path : null,
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Course created successfully.',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// The rest of the controller remains the same...

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
    res.json({
      status: 'success',
      message: 'Courses retrieved successfully.',
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
    }

    res.json({
      status: 'success',
      message: 'Course retrieved successfully.',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, uploader, description } = req.body;
  const userId = req.user.userId;

  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
    }

    if (course.authorId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only update your own courses.',
      });
    }

    const dataToUpdate = { title, uploader, description };
    if (req.file) {
      dataToUpdate.thumbnail = req.file.path;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json({
      status: 'success',
      message: 'Course updated successfully.',
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
    }

    if (course.authorId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only delete your own courses.',
      });
    }

    await prisma.course.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      status: 'success',
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
