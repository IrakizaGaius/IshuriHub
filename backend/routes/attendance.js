const express = require('express');
const router = express.Router();
const { Attendance, sequelize, Student, Parent, Term  } = require('../models');
const { ParentData } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { studentId, termId, date, status } = req.body;

  // Start a transaction to ensure atomicity
  const transaction = await sequelize.transaction();

  try {
    // Validate required fields
    if (!studentId || !termId || !date || !status) {
      return res.status(400).json({ message: 'Student ID, Term ID, date, and status are required.' });
    }

    const student = await Student.findOne({
      where: { id: studentId },
      attributes: ['id', 'name', 'parentId', 'Class'],
      transaction
    });

    if (!student) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Student not found. Please enter a valid student ID.' });
    }

    // Check if the term exists
    const term = await Term.findOne({
      where: { id: termId },
      attributes: ['id', 'startDate', 'endDate'],
      transaction
    });

    if (!term) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Term not found. Please enter a valid term ID.' });
    }

    const existingAttendance = await Attendance.findOne({
      where: { studentId, termId, date },
      transaction
    });

    if (existingAttendance) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Attendance already recorded for this student on this date.' });
    }

    const attendance = await Attendance.create(
      {
        studentId,
        termId,
        date,
        status
      },
      { transaction }
    );

    
    const parent = await Parent.findOne({
      where: { id: student.parentId },
      attributes: ['id', 'email'],
      transaction
    });

    if (parent?.email) {
      const subject = 'Student Attendance Notification';
      const message = `Dear Parent,\n\nYour child, ${student.name}, has been marked as "Present" for today, ${new Date(date).toLocaleDateString()}.\n\nBest regards,\nSchool Admin`;

      ParentData(parent.email, subject, message).catch(err => {
        console.error('Error sending email:', err.message);
      });
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Read
router.get('/', async (req, res) => {
  try {
    const attendances = await Attendance.findAll();
    res.status(200).json(attendances);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (attendance) {
      res.status(200).json(attendance);
    } else {
      res.status(404).json({ error: 'Attendance not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Attendance.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAttendance = await Attendance.findByPk(req.params.id);
      res.status(200).json(updatedAttendance);
    } else {
      res.status(404).json({ error: 'Attendance not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Attendance.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Attendance not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;