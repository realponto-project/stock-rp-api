const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const supContact = sequelize.define("supContact", {
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
    }
  })

  supContact.associate = (models) => {
    supContact.belongsTo(models.supProvider, { foreignKey: { allowNull: false } })
  }

  return supContact
}
