const express = require('express');
const router = express.Router();
const { Notification } = require('../models');

// Create
router.post('/', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (notification) {
      res.status(200).json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Notification.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedNotification = await Notification.findByPk(req.params.id);
      res.status(200).json(updatedNotification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;