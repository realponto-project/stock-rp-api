'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    "supProvider",
    "referencePoint",
    {
      type: Sequelize.STRING
    }
  ),

  down: (queryInterface) => queryInterface.removeColumn("supProvider", "referencePoint"),
};
