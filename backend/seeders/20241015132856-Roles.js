'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      { name: 'School Admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Teacher', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Parent', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};