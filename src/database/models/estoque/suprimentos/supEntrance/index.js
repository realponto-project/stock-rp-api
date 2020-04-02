const Sequelize = require("sequelize");

module.exports = sequelize => {
  const supEntrance = sequelize.define("supEntrance", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },

    priceUnit: {
      type: Sequelize.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },

    discount: {
      type: Sequelize.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },

    total: {
      type: Sequelize.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  supEntrance.associate = models => {
    supEntrance.belongsTo(models.supProduct, {
      foreignKey: {
        allowNull: false
      }
    });
    supEntrance.belongsTo(models.supProvider, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return supEntrance;
};
