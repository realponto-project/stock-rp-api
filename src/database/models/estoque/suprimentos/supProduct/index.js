const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const supProduct = sequelize.define("supProduct", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    code: {
      type: Sequelize.STRING,
      unique: true,
    },

    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },

    unit: {
      type: Sequelize.ENUM(["UNID", "PÇ", "CX", "LT"]),
      allowNull: false,
    },

    amount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    minimumQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 5,
      validate: {
        min: 1,
      },
    },

    esporadico: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  });

  supProduct.associate = (models) => {
    supProduct.belongsTo(models.manufacturer, {
      foreignKey: {
        allowNull: false,
      },
    });
    supProduct.hasMany(models.supEntrance);
  };

  return supProduct;
};
