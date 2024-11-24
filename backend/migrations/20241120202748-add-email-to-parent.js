'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Parents', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Parents', 'email');
  },
};
