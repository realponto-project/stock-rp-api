module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "user",
          "tecnico",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("user", "tecnico", {
          transaction: t,
        }),
      ]);
    });
  },
};
