const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

// Create a new team member
const createTeamMember = async (req, res) => {
  let { name, skills, position } = req.body;

  if (!name || !skills || !position) {
    return res.status(400).json({
      status: 'fail',
      message: 'Name, skills, and position are required.',
    });
  }

  if (!['MENTOR', 'SINARIDESA_TEAM'].includes(position)) {
    return res.status(400).json({
      status: 'fail',
      message: "Invalid position. Must be 'MENTOR' or 'SINARIDESA_TEAM'.",
    });
  }

  let skillsArray = [];
  if (typeof skills === 'string') {
    skillsArray = skills.split(',').map(s => s.trim());
  } else if (Array.isArray(skills)) {
    skillsArray = skills;
  }

  if (skillsArray.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Skills cannot be empty.',
    });
  }

  try {
    const teamMember = await prisma.team.create({
      data: {
        name,
        position,
        picture: req.file ? req.file.path : null,
        skills: {
          connectOrCreate: skillsArray.map(skillName => ({
            where: { name: skillName },
            create: { name: skillName },
          })),
        },
      },
      include: {
        skills: true, // Include skills in the response
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Team member created successfully.',
      data: teamMember,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await prisma.team.findMany({
      include: {
        skills: true, // Include skills in the response
      },
    });
    res.json({
      status: 'success',
      message: 'Team members retrieved successfully.',
      data: teamMembers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Get a single team member by ID
const getTeamMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    const teamMember = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        skills: true, // Include skills in the.response
      },
    });

    if (!teamMember) {
      return res.status(404).json({
        status: 'fail',
        message: 'Team member not found.',
      });
    }

    res.json({
      status: 'success',
      message: 'Team member retrieved successfully.',
      data: teamMember,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Update a team member
const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  let { name, skills, position } = req.body;

  if (position && !['MENTOR', 'SINARIDESA_TEAM'].includes(position)) {
    return res.status(400).json({
      status: 'fail',
      message: "Invalid position. Must be 'MENTOR' or 'SINARIDESA_TEAM'.",
    });
  }

  try {
    const dataToUpdate = { name, position };
    if (req.file) {
      dataToUpdate.picture = req.file.path;
    }

    if (skills) {
      let skillsArray = [];
      if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(s => s.trim());
      } else if (Array.isArray(skills)) {
        skillsArray = skills;
      }

      if (skillsArray.length > 0) {
        dataToUpdate.skills = {
          set: [], // Disconnect old skills
          connectOrCreate: skillsArray.map(skillName => ({
            where: { name: skillName },
            create: { name: skillName },
          })),
        };
      }
    }

    const updatedTeamMember = await prisma.team.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        skills: true, // Include skills in the response
      },
    });

    res.json({
      status: 'success',
      message: 'Team member updated successfully.',
      data: updatedTeamMember,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Team member not found.',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

// Delete a team member
const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.team.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      status: 'success',
      message: 'Team member deleted successfully.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Team member not found.',
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
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
};
