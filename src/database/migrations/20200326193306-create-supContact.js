module.exports = {
  up: (queryInterface, Sequelize) => {
    const supContact = queryInterface.createTable("supContact", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      telphone: {
        type: Sequelize.STRING,
        allowNull: false,
        set(oldValue) {
          const newValue = oldValue.replace(/\.|-/gi, "")
          this.setDataValue("telphone", newValue)
        }
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true }
      },

      supProviderId: {
        type: Sequelize.UUID,
        references: {
          model: "supProvider",
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
    })

    return supContact
  },

  down: queryInterface => queryInterface.dropTable("supContact")
}
