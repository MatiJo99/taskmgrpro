const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error (Prisma unique constraint violation code is P2002)
  if (err.code === 'P2002') {
    errors.email = 'that email is already registered';
    return errors;
  }

  // Fields missing validation error
  if (err.message === 'fields required') {
    errors.email = 'Email and password are required';
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  // Since your React frontend handles rendering UI pages, this endpoint sends status confirmation
  res.status(200).json({ message: 'Signup endpoint ready' });
};

module.exports.login_get = (req, res) => {
  res.status(200).json({ message: 'Login endpoint ready' });
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error('fields required');
    }

    // Hash the password manually since Prisma doesn't have built-in Mongoose middleware hooks
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        password: hashedPassword,
      },
    });

    const token = createToken(user.id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user.id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error('fields required');
    }

    // Look up the user by email with Prisma
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      throw new Error('incorrect email');
    }

    // Verify password with bcrypt
    const authSuccess = await bcrypt.compare(password, user.password);
    if (!authSuccess) {
      throw new Error('incorrect password');
    }

    const token = createToken(user.id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user.id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  // Send a JSON response for your React frontend to handle navigation rather than a hard server redirect
  res.status(200).json({ logout: true });
};