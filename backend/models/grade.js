'use strict';
module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Subjects',
        key: 'id'
      }
    },
    testType: {
      type: DataTypes.ENUM('test', 'exam'), // Adding testType as an ENUM
      allowNull: false,
      validate: {
        isIn: [['test', 'exam']] // Validation to ensure only 'test' or 'exam'
      }
    },
    marks: { // Renaming score to marks
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {});

  Grade.associate = function(models) {
    Grade.belongsTo(models.Student); // Grade belongs to a Student
    Grade.belongsTo(models.Subject, { foreignKey: 'subjectId' }); // Grade belongs to a Subject
  };

  return Grade;
};
