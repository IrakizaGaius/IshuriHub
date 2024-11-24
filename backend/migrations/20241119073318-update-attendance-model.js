'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Attendances', 'termId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Terms',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Attendances', 'studentId');
    await queryInterface.removeColumn('Attendances', 'termId');
  },
};