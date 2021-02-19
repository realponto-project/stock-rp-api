"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    "osParts",
    "accessSecurity",
    {
      type: Sequelize.STRING,
      allowNull: true,
    }
  ),

  down: (queryInterface) => queryInterface.removeColumn("osParts", "accessSecurity"),
};
