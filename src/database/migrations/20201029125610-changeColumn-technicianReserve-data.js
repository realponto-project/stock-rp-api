module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.changeColumn(
      "technicianReserve",
      "data",
      { allowNull: true, type: Sequelize.DATE },
      { transaction: t }
    )
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.changeColumn(
      "technicianReserve",
      "data",
      { defaultValue: Sequelize.NOW, type: Sequelize.DATE },
      { transaction: t }
    )
  ]))
}
