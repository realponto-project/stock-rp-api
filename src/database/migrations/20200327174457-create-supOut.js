"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const supOut = queryInterface.createTable("supOut", {
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

      solicitante: {
        type: Sequelize.STRING,
        allowNull: false
      },

      emailSolic: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },

      emailResp: {
        type: Sequelize.STRING,
        allowNull: true
      },

      responsibleUser: {
        type: Sequelize.STRING,
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

    return supOut;
  },

  down: queryInterface => queryInterface.dropTable("supOut")
};
