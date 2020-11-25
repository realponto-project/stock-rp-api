module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn(
      "equip",
      "reservaInternoPartId",
      {
        type: Sequelize.UUID,
        references: {
          model: "reservaInternoParts",
          key: "id"
        },
        allowNull: true,
        defaultValue: null
      },
      { transaction: t }
    ),
    queryInterface.addColumn(
      "equip",
      "technicianReserveId",
      {
        type: Sequelize.UUID,
        references: {
          model: "technicianReserve",
          key: "id"
        },
        allowNull: true,
        defaultValue: null
      },
      { transaction: t }
    ),
    queryInterface.addColumn(
      "user",
      "technicianId",
      {
        type: Sequelize.UUID,
        references: {
          model: "technician",
          key: "id"
        },
        allowNull: true,
        defaultValue: null
      },
      { transaction: t }
    ),
    queryInterface.addColumn(
      "equip",
      "prevAction",
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      { transaction: t }
    )
  ])),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn("equip", "reservaInternoPartId", { transaction: t }),
    queryInterface.removeColumn("equip", "technicianReserveId", { transaction: t }),
    queryInterface.removeColumn("user", "technicianId", { transaction: t }),
    queryInterface.removeColumn("equip", "prevAction", { transaction: t })
  ]))
}
