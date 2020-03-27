const Sequelize = require("sequelize");

module.exports = sequelize => {
  const supEntrance = sequelize.define("supEntrance", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    amount: { type: Sequelize.INTEGER, allowNull: false },

    solicitante: {
      type: Sequelize.STRING,
      allowNull: false
    },

    emailSolic: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },

    emailResp: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    }
  });

  supEntrance.associate = models => {
    supEntrance.belongsTo(models.supProduct, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return supEntrance;
};
