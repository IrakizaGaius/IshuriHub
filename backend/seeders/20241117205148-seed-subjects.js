'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Subjects', [
      { name: 'Math', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Physics', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chemistry', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Geography', createdAt: new Date(), updatedAt: new Date() },
      { name: 'History', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Entrepreneurship', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Economics', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biology', createdAt: new Date(), updatedAt: new Date() },
      { name: 'French', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kinyarwanda', createdAt: new Date(), updatedAt: new Date() },
      { name: 'English', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Literature', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Computer Science', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sports', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Subjects', null, {});
  }
};
