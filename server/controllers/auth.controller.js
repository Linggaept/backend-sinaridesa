const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password are required.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Do not return the password in the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: 'fail',
        message: 'Email already in use. Please use a different email.',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password are required.',
    });
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    await prisma.users.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        accessToken,
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

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ 
      status: 'fail',
      message: 'Refresh token not found.' 
    });
  }

  try {
    const user = await prisma.users.findFirst({ where: { refreshToken } });

    if (!user) {
      return res.status(403).json({ 
        status: 'fail',
        message: 'Invalid refresh token.' 
      });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          status: 'fail',
          message: 'Invalid refresh token.' 
        });
      }

      const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      res.json({
        status: 'success',
        message: 'Token refreshed successfully.',
        data: {
          accessToken,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.sendStatus(204); // No content
  }

  const user = await prisma.users.findFirst({ where: { refreshToken } });

  if (user) {
    await prisma.users.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie('refreshToken');
  res.json({ 
    status: 'success',
    message: 'Logout successful.' 
  });
};


module.exports = { register, login, refreshToken, logout };