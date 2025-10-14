const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({
        status: "fail",
        message: "Name, email, and password are required.",
      });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Hardcode role to USER for all new sign-ups
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res
      .status(201)
      .json({
        status: "success",
        message: "User created successfully.",
        data: user,
      });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already exists." });
    }
    res
      .status(500)
      .json({
        status: "error",
        message: "An internal server error occurred.",
        error: error.message,
      });
  }
};

const getAllUsers = async (req, res) => {
  const { search } = req.query;
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.json({
      status: "success",
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "An internal server error occurred.",
        error: error.message,
      });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    }
    res.json({
      status: "success",
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "An internal server error occurred.",
        error: error.message,
      });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;
  const targetUserId = parseInt(id);
  const loggedInUser = req.user;

  // 1. Authorization: Who can update what?
  const isUpdatingOwnProfile = loggedInUser.id === targetUserId;
  const isAdmin = loggedInUser.role === "ADMIN";

  if (!isUpdatingOwnProfile && !isAdmin) {
    return res.status(403).json({
      status: "fail",
      message: "Forbidden: You can only update your own profile.",
    });
  }

  // 2. Prepare data for update
  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;

  // 3. Handle optional password update
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long.",
      });
    }
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  // 4. Handle optional role update (securely)
  // Check if 'role' was explicitly provided in the request body
  if (role !== undefined) {
    // If it was, only admins are allowed to proceed with a role change.
    if (!isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You are not authorized to change user roles.",
      });
    }
    // If the user is an admin, apply the role from the request.
    dataToUpdate.role = role;
  }

  // 5. Check if there is any data to update
  if (Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "No fields to update provided.",
    });
  }

  // 6. Perform update
  try {
    const user = await prisma.users.update({
      where: { id: targetUserId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      status: "success",
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already exists." });
    }
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Optional: Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
    return res
      .status(400)
      .json({ status: "fail", message: "You cannot delete your own account." });
  }

  try {
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });
    res.json({
      status: "success",
      message: "User deleted successfully.",
    });
  } catch (error) {
    // Handle case where user is not found
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    }
    res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
