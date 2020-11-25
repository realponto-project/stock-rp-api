/* eslint-disable max-len */


module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn("osParts",
      "technicianReserveId",
      {
        type: Sequelize.UUID,
        references: {
          model: "technicianReserve",
          key: "id"
        },
        allowNull: true
      },
      { transaction: t })
  ])),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([queryInterface.removeColumn("osParts", "technicianReserveId", { transaction: t })]))
}
