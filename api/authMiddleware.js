const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const JWT_SECRET = 'task manager secret signature';

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // VERY IMPORTANT
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Check current user
const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { requireAuth, checkUser };