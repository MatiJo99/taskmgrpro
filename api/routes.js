const express = require('express');
const authController = require('./authController');
const { requireAuth, checkUser } = require('./authMiddleware'); 

function routes(prisma) {
  const router = express.Router();

  // Authentication API Endpoints
  router.get('/user-status', checkUser, (req, res) => {
    if (req.user) {
      res.json({ loggedIn: true, email: req.user.email });
    } else {
      res.json({ loggedIn: false });
    }
  });

  router.post('/signup', authController.signup_post);
  router.post('/login', authController.login_post);
  router.get('/logout', authController.logout_get);
  
  router.get('/tasks', requireAuth, async (req, res, next) => {
    console.log(req.user);
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user.id },
        orderBy: { id: 'asc' }
      });
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  });

  router.post('/tasks', requireAuth, async (req, res, next) => {
    try {
      const { description } = req.body;
      if (!description || description.trim() === '') {
        return res.status(400).json({ error: 'Description is required' });
      }
      const task = await prisma.task.create({
        data: {
          description: description.trim(),
          status: 'pending',
          userId: req.user.id
        }
      });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  });

  router.put('/tasks/:id/complete', requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const task = await prisma.task.findFirst({
        where: { id, userId: req.user.id }
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: 'completed' }
      });
      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/tasks/:id', requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const task = await prisma.task.findFirst({
        where: { id, userId: req.user.id }
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      await prisma.task.delete({
        where: { id }
      });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = routes;