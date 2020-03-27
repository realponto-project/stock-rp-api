const Sequelize = require("sequelize");

module.exports = sequelize => {
  const supProduct = sequelize.define("supProduct", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },

    unit: {
      type: Sequelize.ENUM(["UNID", "PÇ", "CX", "LT"]),
      allowNull: false
    },

    amount: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });

  supProduct.associate = models => {
    supProduct.belongsTo(models.manufacturer, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return supProduct;
};
