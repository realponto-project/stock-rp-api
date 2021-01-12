const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const supOut = sequelize.define("supOut", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },

    solicitante: {
      type: Sequelize.STRING,
      allowNull: false
    },

    emailSolic: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },

    emailResp: {
      type: Sequelize.STRING,
      allowNull: true
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })

  supOut.associate = (models) => {
    supOut.belongsTo(models.supProduct, { foreignKey: { allowNull: false } })
  }

  return supOut
}
