'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Terms',
      [
        {
          name: 'Term 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Term 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Final Term',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Terms', null, {});
  },
};