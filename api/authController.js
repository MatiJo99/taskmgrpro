const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const validator = require('validator');

const prisma = new PrismaClient();
const maxAge = 3 * 24 * 60 * 60;
const JWT_SECRET = 'task manager secret signature';

const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: maxAge });
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    let errors = { email: '', password: '' };
    if (!email || !password) {
      if (!email) errors.email = 'Fields required';
      if (!password) errors.password = 'Fields required';
      return res.status(400).json({ errors });
    }
    if (!validator.isEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      errors.password = 'Minimum password length is 6 characters';
    }
    if (errors.email || errors.password) {
      return res.status(400).json({ errors });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: { email: email.trim(), password: hashedPassword }
    });
    const token = createToken(user.id);
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: maxAge * 1000
    });
    res.status(201).json({ user: user.id });
  } catch (err) {
    let errors = { email: '', password: '' };
    if (err.code === 'P2002') errors.email = 'That email is already registered';
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email: email?.trim() || '' } });
    if (!user) return res.status(400).json({ errors: { email: 'Email not registered' } });
    const authSuccess = await bcrypt.compare(password, user.password);
    if (!authSuccess) return res.status(400).json({ errors: { password: 'Password incorrect' } });
    const token = createToken(user.id);
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: maxAge * 1000
    });
    res.status(200).json({ user: user.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.json({ success: true });
};