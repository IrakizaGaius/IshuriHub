module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['PRESENT', 'ABSENT'],
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    termId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Terms',
        key: 'id',
      },
    },
  }, {});

  Attendance.associate = function(models) {
    Attendance.belongsTo(models.Student, { foreignKey: 'studentId', as: 'Student' });
    Attendance.belongsTo(models.Term, { foreignKey: 'termId', as: 'Term' });
  };

  return Attendance;
};