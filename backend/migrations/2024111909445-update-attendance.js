'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Then, make termId NOT NULL
    await queryInterface.changeColumn('Attendances', 'termId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Attendances', 'studentId');
    await queryInterface.removeColumn('Attendances', 'termId');
  },
};
