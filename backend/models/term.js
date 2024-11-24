'use strict';
module.exports = (sequelize, DataTypes) => {
  const Term = sequelize.define('Term', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Term;
};
