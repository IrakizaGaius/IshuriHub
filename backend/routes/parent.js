const express = require('express');
const router = express.Router();
const { Parent } = require('../models');
const { Sequelize, Op } = require('sequelize');
const {ParentData} = require('../services/emailService');
const { sequelize } = require('../models');


router.post('/', async (req, res) => {
  const t = await sequelize.transaction(); // Start a new transaction
  try {
    const { name, phoneNumber, email } = req.body;

    // Validate that both Name, PhoneNumber, and Email are provided
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name, phone numberare required.' });
    }

    // Check if Phone number is 10 digits and starts with 0
    if (phoneNumber.length !== 10 || phoneNumber[0] !== '0') {
      return res.status(400).json({ error: 'Phone number must be 10 digits and start with 0.' });
    }

    // emailis optional, but if provided, validate it
    if (email) {
      // Check if email is valid using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
  }
    // Check if email or phone number already exists in database in a single query
    const existingParent = await Parent.findOne({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber }
        ]
      },
      transaction: t, // Use the transaction for the query
    });

    if (existingParent) {
      let errorMessage = '';
      if (existingParent.email === email) {
        errorMessage = 'Email already exists.';
      } else {
        errorMessage = 'Phone number already exists.';
      }
      await t.rollback(); // Rollback transaction if validation fails
      return res.status(400).json({ error: errorMessage });
    }

    // Create a new parent with an ACTIVE status by default
    const parent = await Parent.create({
      name,
      phoneNumber,
      email,
      status: 'ACTIVE', 
    }, { transaction: t });

    if (email) {
    const subject = 'Welcome to the School!';
    const message = `Dear ${name},\n\nYou have been successfully registered as a parent. Stay tuned for updates regarding your child.\n\nBest regards,\nSchool Admin`;
    ParentData(email, subject, message);
    }
    await t.commit();
    res.status(201).json(parent);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const parents = await Parent.findAll();
    res.status(200).json(parents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch dashboard metrics with date filtering
router.post('/parents-metrics', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    // Construct the date conditions to include the full range from start to end
    const dateConditions = {};
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`); // Midnight UTC on start date
      const end = new Date(`${endDate}T23:59:59.999Z`); // End of day on end date (23:59:59.999)

      dateConditions.createdAt = {
        [Sequelize.Op.gte]: start,  // Greater than or equal to the start date
        [Sequelize.Op.lte]: end,    // Less than or equal to the end date
      };
    }

    const totalParents = await Parent.count({ where: dateConditions });
    const activeParents = await Parent.count({
      where: {
        ...dateConditions,
        status: 'ACTIVE'
      }
    });

    res.status(200).json({ totalParents, activeParents });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});



// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    if (parent) {
      res.status(200).json(parent);
    } else {
      res.status(404).json({ error: 'Parent not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction(); // Start a new transaction
  try {
    const { phoneNumber, email, ...otherFields } = req.body;

    // Validate the phone number
    if (phoneNumber && !/^[0]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        error: 'Phone number must be 10 digits and start with 0.',
      });
    }

    // Check if the email or phone number is being updated and if they already exist
    const existingParent = await Parent.findOne({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber }
        ],
        id: { [Op.ne]: req.params.id }, // Ensure we're not checking the parent itself
      },
      transaction: t, // Use the transaction for the query
    });

    if (existingParent) {
      let errorMessage = '';
      if (existingParent.email === email) {
        errorMessage = 'Email already exists.';
      } else {
        errorMessage = 'Phone number already exists.';
      }
      await t.rollback(); // Rollback transaction if validation fails
      return res.status(400).json({ error: errorMessage });
    }

    // Proceed with updating the parent data
    const [updated] = await Parent.update(
      { phoneNumber, email, ...otherFields },
      {
        where: { id: req.params.id },
        transaction: t, // Ensure the update happens within the transaction
      }
    );

    if (updated) {
      const updatedParent = await Parent.findByPk(req.params.id, { transaction: t });

      // Send email notification asynchronously
      const subject = 'Your Information Has Been Updated';
      const message = `Dear ${updatedParent.name},\n\nYour information has been updated successfully in our system.\n\nBest regards,\nSchool Admin`;
      // Send email asynchronously (preferably offload to a background job)
      ParentData(updatedParent.email, subject, message);

      await t.commit(); // Commit the transaction only if everything succeeded
      return res.status(200).json(updatedParent);
    } else {
      await t.rollback(); // Rollback transaction if no parent was updated
      return res.status(404).json({ error: 'Parent not found' });
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    res.status(500).json({ error: error.message });
  }
});



// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Parent.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Parent not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;