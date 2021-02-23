'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    "user",
    "cardId",
    {
      type: Sequelize.STRING,
      allowNull: true
    }
  ),

  down: (queryInterface) => queryInterface.removeColumn("user", "cardId"),
};
