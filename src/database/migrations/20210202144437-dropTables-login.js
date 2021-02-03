'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('login')
  },

  down: (queryInterface, Sequelize) => {
    const login = queryInterface.createTable('login', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      password: {
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
    })

    return login
  }
}
