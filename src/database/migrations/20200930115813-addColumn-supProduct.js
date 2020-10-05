module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "supProduct",
          "esporadico",
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("supProduct", "esporadico", {
          transaction: t,
        }),
      ]);
    });
  },
};
