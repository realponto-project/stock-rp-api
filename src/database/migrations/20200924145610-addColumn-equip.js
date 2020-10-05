module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "equip",
          "reservaInternoPartId",
          {
            type: Sequelize.UUID,
            references: {
              model: "reservaInternoParts",
              key: "id",
            },
            allowNull: true,
            defaultValue: null,
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
              key: "id",
            },
            allowNull: true,
            defaultValue: null,
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
              key: "id",
            },
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("equip", "reservaInternoPartId", {
          transaction: t,
        }),
        queryInterface.removeColumn("equip", "technicianReserveId", {
          transaction: t,
        }),
        queryInterface.removeColumn("user", "technicianId", {
          transaction: t,
        }),
      ]);
    });
  },
};
