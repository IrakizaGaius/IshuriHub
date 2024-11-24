const express = require('express');
const router = express.Router();
const { Term } = require('../models');

// Get all terms
router.get('/', async (req, res) => {
  try {
    const terms = await Term.findAll();
    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// Update a term
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const term = await Term.findByPk(id);

    if (!term) {
      return res.status(404).json({ error: 'Term not found' });
    }

    await term.update({ startDate, endDate });
    res.json(term);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update term' });
  }
});

module.exports = router;