// Example migration to add loginCode and loginCodeExpires columns
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'loginCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'loginCodeExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'loginCode');
    await queryInterface.removeColumn('Users', 'loginCodeExpires');
  },
};
