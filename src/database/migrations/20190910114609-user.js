module.exports = {
  up: (queryInterface, Sequelize) => {
    const user = queryInterface.createTable('user', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customized: {
        type: Sequelize.BOOLEAN,
        allowNull: false
        // defaultValue: false,
      },
      responsibleUser: {
        type: Sequelize.STRING,
        allowNull: false
      },

      modulo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

      loginId: {
        type: Sequelize.UUID,
        references: {
          model: 'login',
          key: 'id'
        },
        allowNull: true
      },

      resourceId: {
        type: Sequelize.UUID,
        references: {
          model: 'resources',
          key: 'id'
        },
        allowNull: true
      },

      tecnico: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      technicianId: {
        type: Sequelize.UUID,
        references: {
          model: 'technician',
          key: 'id'
        },
        allowNull: true,
        defaultValue: null
      },

      typeAccountId: {
        type: Sequelize.UUID,
        references: {
          model: 'typeAccount',
          key: 'id'
        },
        allowNull: true
      }
    })

    return user
  },

  down: queryInterface => queryInterface.dropTable('user')
}
