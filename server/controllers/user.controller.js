const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        res.json({ status: 'success', message: 'Users retrieved successfully.', data: users });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'An internal server error occurred.', error: error.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { id: parseInt(id) },
            select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found.' });
        }
        res.json({ status: 'success', message: 'User retrieved successfully.', data: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'An internal server error occurred.', error: error.message });
    }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name } = req.body;

  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden: You can only update your own profile.',
    });
  }

  try {
    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { email, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    res.json({
      status: 'success',
      message: 'User updated successfully.',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Optional: Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
      return res.status(400).json({ status: 'fail', message: 'You cannot delete your own account.'});
  }

  try {
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });
    res.json({
      status: 'success',
      message: 'User deleted successfully.',
    });
  } catch (error) {
    // Handle case where user is not found
    if (error.code === 'P2025') {
        return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };