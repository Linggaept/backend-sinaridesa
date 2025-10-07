const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized: Missing or invalid token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.users.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden: User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ status: 'fail', message: 'Forbidden: Invalid or expired token.' });
  }
};

const optionalAuthenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Invalid token, proceed without authentication
    }
  }
  next();
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ status: 'fail', message: 'Forbidden: This action requires admin privileges.' });
};

module.exports = { authenticateToken, optionalAuthenticateToken, isAdmin };