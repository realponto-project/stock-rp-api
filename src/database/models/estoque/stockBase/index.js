const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const stockBase = sequelize.define("stockBase", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    stockBase: {
      type: Sequelize.ENUM([
        "ESTOQUE",
        "EMPRESTIMO"
      ]),
      allowNull: false
    }
  })

  stockBase.associate = (models) => {
    stockBase.belongsToMany(models.product, { through: "productBase" })
    stockBase.hasMany(models.productBase)
  }

  return stockBase
}
