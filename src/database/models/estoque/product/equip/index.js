const Sequelize = require('sequelize')

module.exports = sequelize => {
  const equip = sequelize.define('equip', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    serialNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },

    reserved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },

    inClient: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },

    loan: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },

    prevAction: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    }
  })

  equip.associate = models => {
    equip.belongsTo(models.productBase, { foreignKey: { allowNull: false } })
    equip.belongsTo(models.osParts)
    equip.belongsTo(models.freeMarketParts)
    // equip.belongsTo(models.reservaInternoParts)
    equip.belongsTo(models.technicianReserve)
    // equip.hasMany(models.emprestimo);
  }

  return equip
}
