const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const osParts = sequelize.define("osParts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: {
      type: Sequelize.STRING,
      defaultValue: "0",
      validate: { min: 0 }
    },

    return: {
      type: Sequelize.STRING,
      defaultValue: "0",
      validate: { min: 0 }
    },

    output: {
      type: Sequelize.STRING,
      defaultValue: "0",
      validate: { min: 0 }
    },

    missOut: {
      type: Sequelize.STRING,
      defaultValue: "0",
      validate: { min: 0 }
    },

    serialNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },

    outSerialNumbers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    },

    observation: {
      type: Sequelize.STRING,
      allowNull: true
    },

    serialNumbers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    },

    accessSecurity:{
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    }
  })

  osParts.associate = (models) => {
    // osParts.belongsToMany(models.product, { through: 'osParts' })
    // osParts.belongsTo(models.product);
    osParts.belongsTo(models.os)
    osParts.belongsTo(models.productBase)
    osParts.belongsTo(models.technicianReserve)
    osParts.belongsTo(models.statusExpedition, { foreignKey: { allowNull: false } })
  }

  return osParts
}
