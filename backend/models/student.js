// backend/models/student.js
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Class: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: ['ACTIVE', 'DISABLED'],
      allowNull: false
    }
  }, {});

  Student.associate = function(models) {
    Student.hasMany(models.Attendance);
    Student.hasMany(models.Grade, { foreignKey: 'studentId' });
    Student.belongsTo(models.Parent, { foreignKey: 'parentId' });
    Student.belongsToMany(models.Subject, {
      through: models.Grade,
      foreignKey: 'studentId',
      otherKey: 'subjectId'
    });
  };

  return Student;
};