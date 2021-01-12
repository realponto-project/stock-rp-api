module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn(
      "supProduct",
      "esporadico",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      { transaction: t }
    )
  ])),

  // eslint-disable-next-line max-len
  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([queryInterface.removeColumn("supProduct", "esporadico", { transaction: t })]))
}
