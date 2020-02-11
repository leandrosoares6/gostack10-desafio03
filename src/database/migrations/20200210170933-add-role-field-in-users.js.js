module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'USER',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'role');
  },
};
