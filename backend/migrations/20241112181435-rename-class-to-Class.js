'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Students', 'class', 'Class');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Students', 'Class', 'class');
  }
};