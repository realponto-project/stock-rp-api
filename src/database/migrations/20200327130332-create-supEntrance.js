"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const supEntrance = queryInterface.createTable("supEntrance", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      priceUnit: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      discount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      total: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      supProviderId: {
        type: Sequelize.UUID,
        references: {
          model: "supProvider",
          key: "id"
        },
        allowNull: false
      },

      supProductId: {
        type: Sequelize.INTEGER,
        references: {
          model: "supProduct",
          key: "id"
        },
        allowNull: false
      },

      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE
      }
    });

    return supEntrance;
  },

  down: queryInterface => queryInterface.dropTable("supEntrance")
};
