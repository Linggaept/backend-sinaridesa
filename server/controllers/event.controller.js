const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

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
    const event = await prisma.event.create({
      data: {
        title,
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
  try {
    const events = await prisma.event.findMany();
    res.json({
      status: 'success',
      message: 'Events retrieved successfully.',
      data: events,
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

// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, participants } = req.body;

  try {
    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (date) dataToUpdate.date = new Date(date);
    if (location) dataToUpdate.location = location;
    if (participants) dataToUpdate.participants = parseInt(participants);
    if (req.files['thumbnail']) dataToUpdate.thumbnail = req.files['thumbnail'][0].path;
    if (req.files['image']) dataToUpdate.image = req.files['image'][0].path;

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
  updateEvent,
  deleteEvent,
};
