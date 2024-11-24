
const express = require('express');
const router = express.Router();
const { Subject } = require('../models');

// Create
router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (subject) {
      res.status(200).json(subject);
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Subject.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedSubject = await Subject.findByPk(req.params.id);
      res.status(200).json(updatedSubject);
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Subject.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;