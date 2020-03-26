"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const manufacturer = queryInterface.createTable("manufacturer", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
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

    return manufacturer;
  },

  down: queryInterface => queryInterface.dropTable("manufacturer")
};
