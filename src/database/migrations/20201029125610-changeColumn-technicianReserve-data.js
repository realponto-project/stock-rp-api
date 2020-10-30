module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "technicianReserve",
          "data",
          { allowNull: true, type: Sequelize.DATE },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "technicianReserve",
          "data",
          { defaultValue: Sequelize.NOW, type: Sequelize.DATE },
          { transaction: t }
        ),
      ]);
    });
  },
};
