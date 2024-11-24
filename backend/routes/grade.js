const express = require('express');
const router = express.Router();
const { Grade, Student, Subject, sequelize, Parent, } = require('../models');
const { ParentData } = require('../services/emailService');


router.post('/', async (req, res) => {
  const { studentId, subjectId, testType, marks } = req.body;

  const transaction = await sequelize.transaction();

  try {
    if (!studentId || !subjectId || !testType || marks === undefined) {
      return res.status(400).json({ error: 'All fields (studentId, subjectId, testType, marks) are required.' });
    }

    const numericMarks = Number(marks);

    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({ error: 'Marks must be a number between 0 and 100.' });
    }

    const student = await Student.findByPk(studentId, { transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    const subject = await Subject.findByPk(subjectId, { transaction });
    if (!subject) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Subject not found' });
    }

    const grade = await Grade.create(
      {
        studentId,
        subjectId,
        testType,
        marks,
        parentId: student.parentId,
      },
      { transaction }
    );

    const parent = await Parent.findByPk(student.parentId, { transaction });

    if (parent?.email) {
      const subjectLine = `New Grade for ${student.name} in ${subject.name}`;
      const message = `Dear Parent,\n\nYour child, ${student.name}, has received a new grade in ${subject.name} for the ${testType} test.\n\nMarks: ${marks}% \n\nBest regards,\nSchool Admin`;
      await ParentData(parent.email, subjectLine, message).catch(err => {
        console.error('Error sending email:', err.message);
      });
    }

    await transaction.commit();
    res.status(201).json(grade);

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Fetch all grades
router.get('/', async (req, res) => {
  try {
    const grades = await Grade.findAll({
      include: [
        { model: Student, attributes: ['name'] },
        { model: Subject, attributes: ['name'] },
      ],
    });
    res.status(200).json(grades);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch a grade by ID
router.get('/:id', async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: ['name'] },
        { model: Subject, attributes: ['name'] },
      ],
    });

    if (grade) {
      res.status(200).json(grade);
    } else {
      res.status(404).json({ error: 'Grade not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a grade
router.put('/:id', async (req, res) => {
  const { studentId, subjectId, testType, marks } = req.body;

  try {
    const [updated] = await Grade.update(
      { studentId, subjectId, testType, marks },
      { where: { id: req.params.id } }
    );

    if (updated) {
      const updatedGrade = await Grade.findByPk(req.params.id, {
        include: [
          { model: Student, attributes: ['name'] },
          { model: Subject, attributes: ['name'] },
        ],
      });
      res.status(200).json(updatedGrade);
    } else {
      res.status(404).json({ error: 'Grade not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a grade
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Grade.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Grade not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
