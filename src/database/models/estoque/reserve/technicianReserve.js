const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const technicianReserve = sequelize.define("technicianReserve", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { min: 0 }
    },

    amountAux: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },

    data: { allowNull: true, type: Sequelize.DATE }
  })

  technicianReserve.associate = (models) => {
    technicianReserve.belongsTo(models.product)
    technicianReserve.belongsTo(models.technician)
    technicianReserve.hasMany(models.equip)
    technicianReserve.hasMany(models.osParts)
  }

  return technicianReserve
}
