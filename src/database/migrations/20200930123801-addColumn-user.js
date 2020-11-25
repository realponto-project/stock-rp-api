module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn(
      "user",
      "tecnico",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      { transaction: t }
    )
  ])),

  // eslint-disable-next-line max-len
  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([queryInterface.removeColumn("user", "tecnico", { transaction: t })]))
}
