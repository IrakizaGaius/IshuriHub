'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Making the 'email' column nullable
    await queryInterface.changeColumn('Parents', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // Allow email to be null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting the 'email' column to not be nullable
    await queryInterface.changeColumn('Parents', 'email', {
      type: Sequelize.STRING,
      allowNull: false, // Revert back to not nullable
    });
  }
};
