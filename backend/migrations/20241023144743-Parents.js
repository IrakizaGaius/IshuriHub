'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Parents', 'status', {
      type: Sequelize.ENUM,
      values: ['ACTIVE', 'DELETED'],
      allowNull: false,
      defaultValue: 'ACTIVE' // Optional: Set a default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Parents', 'status');
  }
};