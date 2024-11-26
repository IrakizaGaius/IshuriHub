const express = require('express');
const router = express.Router();
const { Event, Parent, sequelize} = require('../models');
const { Sequelize, Op } = require('sequelize');
const {ParentData} = require('../services/emailService');



// Helper function to update event status based on date
async function updateEventStatus() {
  const currentDate = new Date();
  await Event.update(
    { status: 'DISABLED' },
    { where: { date: { [Op.lt]: currentDate }, status: 'ACTIVE' } }
  );
}

// List all events, updating statuses where needed
router.get('/', async (req, res) => {
  try {
    await updateEventStatus(); // Automatically update statuses of past events
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});


router.post('/', async (req, res) => {
  const { name, description, date } = req.body;

  if (!name || !description || !date) {
    return res.status(400).json({ error: 'Name, description, and date are required.' });
  }

  // Validate date is in the future
  if (new Date(date) < new Date()) {
    return res.status(400).json({ error: 'Date must be in the future.' });
  }

  const transaction = await sequelize.transaction();

  try {

    const event = await Event.create({
      name,
      description,
      date,
      status: 'ACTIVE'
    }, { transaction });

    const parents = await Parent.findAll({
      attributes: ['email', 'phoneNumber'],
      where: { email: { [Op.ne]: null } },
      transaction 
    });

    const sendEmailsPromises = parents.map(parent => {
      const subject = `New Event: ${name}`;
      const message = `Dear Parent,\n\nWe are excited to inform you about a new event: ${name}. Details:\n\nDescription: ${description}\nDate: ${date}\n\nBest regards,\nSchool Admin`;
      return ParentData(parent.email, subject, message);
    });


    await Promise.all([...sendEmailsPromises]);
    await transaction.commit();
    res.status(201).json(event);
  } catch (error) {
    await transaction.rollback();
    console.error('Error during Event Creation or Email Sending:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Metrics for Events
router.post('/metrics', async (req, res) => {
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

    await updateEventStatus();
    const totalEvents = await Event.count({ where: dateConditions });
    const activeEvents = await Event.count({ where: { ...dateConditions, status: 'ACTIVE' } });
    const disabledEvents = await Event.count({ where: { ...dateConditions, status: 'DISABLED' } });
    res.status(200).json({ totalEvents, activeEvents, disabledEvents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics.' });
  }
});

// Get an Event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      // Update status if the event is past the current date
      if (new Date(event.date) < new Date() && event.status === 'ACTIVE') {
        await event.update({ status: 'DISABLED' });
      }
      res.status(200).json(event);
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// Update an Event
router.put('/:id', async (req, res) => {
  const { name, description, date } = req.body;

  // Start a transaction to ensure atomicity
  const transaction = await sequelize.transaction();

  try {
    // Validate required fields
    if (!name || !description || !date) {
      return res.status(400).json({ error: 'Name, description, and date are required.' });
    }
    // Validate date is in the future
    if (new Date(date) < new Date()) {
      return res.status(400).json({ error: 'Date must be in the future.' });
    }

    // Update the event within the transaction
    const [updated] = await Event.update(req.body, {
      where: { id: req.params.id },
      transaction
    });

    if (!updated) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Fetch the updated event
    const updatedEvent = await Event.findByPk(req.params.id, { transaction });

    // Send email notifications to parents (skip parents without email)
    const parents = await Parent.findAll({
      attributes: ['email'], // Only fetch email
      where: { email: { [Op.ne]: null } }, // Skip parents without email
      transaction
    });

    const sendEmailsPromises = parents.map(parent => {
      const subject = `Event Updated: ${updatedEvent.name}`;
      const message = `Dear Parent,\n\nThe following event has been updated:\n\nEvent Name: ${updatedEvent.name}\nDescription: ${updatedEvent.description}\nDate: ${updatedEvent.date}\n\nBest regards,\nSchool Admin`;
      return ParentData(parent.email, subject, message);
    });

    // Execute all email sends concurrently
    await Promise.all(sendEmailsPromises);

    // Commit the transaction
    await transaction.commit();

    // Respond with the updated event
    res.status(200).json(updatedEvent);
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// Delete an Event
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Delete the event within a transaction
    const deleted = await Event.destroy({
      where: { id: req.params.id },
      transaction
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Fetch all parents' emails
    const parents = await Parent.findAll({
      attributes: ['email'],
      where: { email: { [Op.ne]: null } },
      transaction
    });

    // Prepare email sending promises
    const sendEmailsPromises = parents.map(parent => {
      const subject = `Event Deleted: ${req.params.id}`;
      const message = `Dear Parent,\n\nWe regret to inform you that the following event has been deleted:\n\nEvent ID: ${req.params.id}\n\nBest regards,\nSchool Admin`;
      return ParentData(parent.email, subject, message);
    });

    // Execute all email sends concurrently
    await Promise.all(sendEmailsPromises);

    // Commit the transaction
    await transaction.commit();

    // Respond with no content status as the event is deleted
    res.status(204).send();
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});


module.exports = router;