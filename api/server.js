#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Structured logging for every API request
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${Date.now() - start} ms`
    });
  });

  next();
});

const prisma = new PrismaClient();

const routes = require('./routes')(prisma);
app.use(routes);

// Error handling
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl
  });

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = 5000;

async function start() {
  try {
    await prisma.$connect();

    logger.info({
      message: 'API server started',
      port: PORT
    });

    app.listen(PORT);
  } catch (error) {
    logger.error({
      message: 'Failed to start server',
      error: error.message,
      stack: error.stack
    });

    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;