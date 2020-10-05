"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const reservaInternoParts = queryInterface.createTable(
      "reservaInternoParts",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },

        amount: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        createdAt: {
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },

        updatedAt: {
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },

        deletedAt: {
          defaultValue: null,
          type: Sequelize.DATE,
        },

        reservaInternoId: {
          type: Sequelize.UUID,
          references: {
            model: "reservaInterno",
            key: "id",
          },
          allowNull: true,
        },
        productId: {
          type: Sequelize.UUID,
          references: {
            model: "product",
            key: "id",
          },
          allowNull: true,
        },
      }
    );

    return reservaInternoParts;
  },

  down: (queryInterface) => queryInterface.dropTable("reservaInternoParts"),
};
