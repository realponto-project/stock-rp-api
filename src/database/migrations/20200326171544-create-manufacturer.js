"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const manufacturer = queryInterface.createTable("manufacturer", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      name: {
        type: Sequelize.STRING,
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

    return manufacturer;
  },

  down: queryInterface => queryInterface.dropTable("manufacturer")
};
