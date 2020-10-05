const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const technicianReserve = sequelize.define("technicianReserve", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    amountAux: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    data: { defaultValue: Sequelize.NOW, type: Sequelize.DATE },
  });

  technicianReserve.associate = (models) => {
    technicianReserve.belongsTo(models.product);
    technicianReserve.belongsTo(models.technician);
    technicianReserve.hasMany(models.equip);
  };

  return technicianReserve;
};
