const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const reservaInternoParts = sequelize.define("reservaInternoParts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  reservaInternoParts.associate = (models) => {
    reservaInternoParts.belongsTo(models.product);
    reservaInternoParts.belongsTo(models.reservaInterno);
  };

  return reservaInternoParts;
};
