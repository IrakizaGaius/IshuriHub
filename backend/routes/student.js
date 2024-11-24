const express = require('express');
const router = express.Router();
const { Student, Parent,sequelize } = require('../models');
const { Sequelize } = require('sequelize');
const { ParentData } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { name, Class, parentName } = req.body;

  // Start a transaction to ensure atomicity
  const transaction = await sequelize.transaction();

  try {
    // Validate required fields
    if (!name || !Class || !parentName) {
      return res.status(400).json({ message: 'Name, Class, and parentName are required.' });
    }

    const parent = await Parent.findOne({
      where: { name: parentName },
      attributes: ['id', 'email'],
      transaction
    });

    // If parent does not exist, rollback and return an error response
    if (!parent) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Parent not found. Please enter a valid parent name.' });
    }


    const existingStudent = await Student.findOne({
      where: { name },
      transaction
    });

    if (existingStudent) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Student already exists. Please enter a different name.' });
    }

    // Create a new student
    const student = await Student.create(
      {
        name,
        Class,
        parentId: parent.id,
        status: 'ACTIVE'
      },
      { transaction }
    );

    if (parent.email) {
      const subject = 'New Student Added';
      const message = `Dear ${parentName},\n\nA new student has been successfully added to your account:\n\nStudent Name: ${name}\nClass: ${Class}\And yo will be able to track their performance and Attendance \n\nBest regards,\nSchool Admin`;

      // Send email asynchronously
      ParentData(parent.email, subject, message).catch(err => {
        console.error('Error sending email:', err.message);
      });
    }

    await transaction.commit();
    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch dashboard metrics
router.post('/students-metrics', async (req, res) => {
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
    const totalStudents = await Student.count({ where: dateConditions });
    const activeStudents = await Student.count({where:{ ...dateConditions, status: 'ACTIVE' }});
    const disabledStudents = await Student.count({where:{ ...dateConditions, status: 'DISABLED' }});
    res.status(200).json({ totalStudents, activeStudents, disabledStudents});

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Read by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Update student
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, Class, parentName } = req.body;

    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Parent, attributes: ['id', 'name', 'email'] }],
      transaction
    });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    let parent = student.Parent;
    if (parentName && parentName !== parent?.name) {
      parent = await Parent.findOne({
        where: { name: parentName },
        attributes: ['id', 'name', 'email'],
        transaction
      });

      if (!parent) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Parent not found. Please provide a valid parent name.' });
      }
    }

    await student.update(
      { name, Class, parentId: parent?.id || student.parentId },
      { transaction }
    );


    await transaction.commit();
    if (parent?.email) {
      const subject = 'Student Information Updated';
      const message = `Dear ${parent.name},\n\nThe information for your child, ${name}, has been updated:\n\n- Name: ${name}\n- Class: ${Class}\n\nBest regards,\nSchool Admin`;

      ParentData(parent.email, subject, message).catch(err => {
        console.error('Error sending email:', err.message);
      });
    }

    res.status(200).json(student);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

// Delete a Student
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Parent, attributes: ['id', 'name', 'email'] }],
      transaction
    });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    const parent = student.Parent;
    await student.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    if (parent?.email) {
      const subject = 'Student Deleted';
      const message = `Dear ${parent.name},\n\nThe student record for ${student.name} has been deleted from our system.\n\nBest regards,\nSchool Admin`;

      ParentData(parent.email, subject, message).catch(err => {
        console.error('Error sending email:', err.message);
      });
    }

    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});


// Disable student
router.put('/:id/disable', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.status = 'DISABLED';
    await student.save();

    res.status(200).json({ message: 'Student status updated to DISABLED', student });
  } catch (error) {
    console.error('Error disabling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;