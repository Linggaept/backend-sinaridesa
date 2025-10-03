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

  let existing = await prisma.event.findUnique({ where: { slug } });
  let counter = 2;
  const originalSlug = slug;

  while (existing) {
    slug = `${originalSlug}-${counter}`;
    existing = await prisma.event.findUnique({ where: { slug } });
    counter++;
  }

  return slug;
};

// Create a new event
const createEvent = async (req, res) => {
  const { title, description, date, location, participants } = req.body;

  if (!title || !date || !location || !participants || !req.files['thumbnail']) {
    return res.status(400).json({
      status: 'fail',
      message: 'Title, date, location, participants, and thumbnail are required.',
    });
  }

  try {
    const slug = await generateUniqueSlug(title);
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        date: new Date(date),
        location,
        participants: parseInt(participants),
        thumbnail: req.files['thumbnail'][0].path,
        image: req.files['image'] ? req.files['image'][0].path : null,
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const events = await prisma.event.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const totalEvents = await prisma.event.count({ where });
    const totalPages = Math.ceil(totalEvents / limit);

    res.json({
      status: 'success',
      message: 'Events retrieved successfully.',
      data: events,
      pagination: {
        totalEvents,
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

// Get a single event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found.',
      });
    }

    res.json({
      status: 'success',
      message: 'Event retrieved successfully.',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Get a single event by slug
const getEventBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found.',
      });
    }

    res.json({
      status: 'success',
      message: 'Event retrieved successfully.',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, participants } = req.body;

  try {
    const dataToUpdate = {};
    if (title) {
      dataToUpdate.title = title;
      dataToUpdate.slug = await generateUniqueSlug(title);
    }
    if (description) dataToUpdate.description = description;
    if (date) dataToUpdate.date = new Date(date);
    if (location) dataToUpdate.location = location;
    if (participants) dataToUpdate.participants = parseInt(participants);
    if (req.files && req.files.thumbnail) {
      dataToUpdate.thumbnail = req.files.thumbnail[0].path;
    }
    if (req.files && req.files.image) {
      dataToUpdate.image = req.files.image[0].path;
    }

    // Check if there is anything to update
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No fields to update provided.',
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json({
      status: 'success',
      message: 'Event updated successfully.',
      data: updatedEvent,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found.',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      status: 'success',
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found.',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
};
