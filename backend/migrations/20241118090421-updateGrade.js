'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'testType' column to the 'Grades' table
    await queryInterface.addColumn('Grades', 'testType', {
      type: Sequelize.ENUM('test', 'exam'),
      allowNull: false,
      defaultValue: 'test' // Default value to avoid NULL issues
    });

    // Rename 'score' column to 'marks' in the 'Grades' table
    await queryInterface.renameColumn('Grades', 'score', 'marks');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'testType' column from the 'Grades' table
    await queryInterface.removeColumn('Grades', 'testType');

    // Rename 'marks' column back to 'score' in the 'Grades' table
    await queryInterface.renameColumn('Grades', 'marks', 'score');
  }
};
