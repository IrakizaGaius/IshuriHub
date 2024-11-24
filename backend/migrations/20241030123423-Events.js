'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Events', 'description', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Events', 'description');
  }
};