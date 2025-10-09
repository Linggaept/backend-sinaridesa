const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const generateUniqueSlug = async (title) => {
  let slug = title
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  let existing = await prisma.course.findUnique({ where: { slug } });
  let counter = 2;
  const originalSlug = slug;

  while (existing) {
    slug = `${originalSlug}-${counter}`;
    existing = await prisma.course.findUnique({ where: { slug } });
    counter++;
  }

  return slug;
};

// Create a new course
const createCourse = async (req, res) => {
  const { title, uploader, description } = req.body;
  const authorId = req.user.id;

  if (!title || !uploader) {
    return res.status(400).json({
      status: 'fail',
      message: 'Title and uploader are required.',
    });
  }

  try {
    const slug = await generateUniqueSlug(title);

    const course = await prisma.course.create({
      data: {
        title,
        slug,
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

// Get all courses with pagination and search
const getAllCourses = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { uploader: { contains: search, mode: 'insensitive' } },
            { author: { name: { contains: search, mode: 'insensitive' } } },
            { author: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const courses = await prisma.course.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    const totalCourses = await prisma.course.count({ where });
    const totalPages = Math.ceil(totalCourses / limit);

    res.json({
      status: 'success',
      message: 'Courses retrieved successfully.',
      data: courses,
      pagination: {
        totalCourses,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
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

// Get a single course by slug
const getCourseBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
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

  try {
    const dataToUpdate = { title, uploader, description };
    if (title) {
      dataToUpdate.slug = await generateUniqueSlug(title);
    }
    if (req.files) {
      if (req.files.thumbnail) {
        dataToUpdate.thumbnail = req.files.thumbnail[0].path;
      }
      if (req.files.coursePdf) {
        dataToUpdate.filePath = req.files.coursePdf[0].path;
      }
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

  try {
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
  getCourseBySlug,
  updateCourse,
  deleteCourse,
};