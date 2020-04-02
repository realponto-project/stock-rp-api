"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const supProduct = queryInterface.createTable("supProduct", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      code: {
        type: Sequelize.STRING,
        unique: true
      },

      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },

      unit: {
        type: Sequelize.ENUM(["UNID", "PÇ", "CX", "LT"]),
        allowNull: false
      },

      amount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
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
      },
      manufacturerId: {
        type: Sequelize.UUID,
        references: {
          model: "manufacturer",
          key: "id"
        },
        allowNull: false
      }
    });

    return supProduct;
  },

  down: queryInterface => queryInterface.dropTable("supProduct")
};
