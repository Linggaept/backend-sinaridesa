const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name } = req.body;

  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden: You can only update your own profile.',
    });
  }

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { email, name },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'User updated successfully.',
      data: userWithoutPassword,
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

  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden: You can only delete your own profile.',
    });
  }

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({
      status: 'success',
      message: 'User deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

module.exports = { updateUser, deleteUser };
