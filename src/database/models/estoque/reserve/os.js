const Sequelize = require('sequelize')

module.exports = sequelize => {
  const os = sequelize.define('os', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    os: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },

    razaoSocial: {
      type: Sequelize.STRING,
      allowNull: true
    },

    cnpj: {
      type: Sequelize.STRING,
      allowNull: true
    },

    cpf: {
      type: Sequelize.STRING,
      allowNull: true
    },

    trackId: {
      type: Sequelize.STRING,
      allowNull: true
    },

    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(),
      timestamps: false
    }
  })

  os.associate = models => {
    // os.hasMany(models.osParts)
    os.hasOne(models.osParts)
    os.belongsToMany(models.productBase, { through: 'osParts' })
    os.belongsTo(models.technician, { foreignKey: { allowNull: true } })
  }

  return os
}
