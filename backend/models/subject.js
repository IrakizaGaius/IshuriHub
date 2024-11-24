// backend/models/subject.js
module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });
  
  Subject.associate = function(models) {
    Subject.hasMany(models.Grade, { foreignKey: 'subjectId' });
  };
  
  return Subject;
};