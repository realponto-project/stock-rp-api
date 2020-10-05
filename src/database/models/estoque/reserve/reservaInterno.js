const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const reservaInterno = sequelize.define("reservaInterno", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    razaoSocial: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(),
      timestamps: false,
    },
  });

  reservaInterno.associate = (models) => {
    reservaInterno.belongsToMany(models.product, {
      through: "reservaInternoParts",
    });
    reservaInterno.belongsTo(models.technician, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return reservaInterno;
};
