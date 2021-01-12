const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const productBase = sequelize.define("productBase", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: {
      type: Sequelize.STRING,
      defautValue: "0",
      validate: { min: 0 }
    },

    available: {
      type: Sequelize.STRING,
      defautValue: "0",
      validate: { min: 0 }
    },

    analysis: {
      type: Sequelize.STRING,
      defautValue: "0",
      validate: { min: 0 }
    },

    preAnalysis: {
      type: Sequelize.STRING,
      defautValue: "0",
      validate: { min: 0 }
    },

    reserved: {
      type: Sequelize.STRING,
      defautValue: "0",
      validate: { min: 0 }
    }
  })

  productBase.associate = (models) => {
    productBase.hasMany(models.equip)

    productBase.belongsTo(models.product, { foreignKey: { allowNull: false } })
    productBase.belongsTo(models.stockBase, { foreignKey: { allowNull: true } })
    productBase.belongsToMany(models.os, { through: "osParts" })
  }

  return productBase
}
