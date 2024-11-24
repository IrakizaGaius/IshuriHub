'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Students', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'DISABLED'),
      allowNull: false,
      defaultValue: 'ACTIVE' // Set default status as ACTIVE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Students', 'status');
  }
};