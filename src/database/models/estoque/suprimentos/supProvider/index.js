const Sequelize = require("sequelize");

module.exports = sequelize => {
  const supProvider = sequelize.define("supProvider", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    razaoSocial: {
      type: Sequelize.STRING
    },

    cnpj: {
      type: Sequelize.STRING,
      set(oldValue) {
        // eslint-disable-next-line no-useless-escape
        const newValue = oldValue.replace(/\D/gi, "");
        this.setDataValue("cnpj", newValue);
      }
    },

    street: {
      type: Sequelize.STRING,
      allowNull: false
    },

    number: {
      type: Sequelize.STRING,
      allowNull: false
    },

    complement: {
      type: Sequelize.STRING
    },

    city: {
      type: Sequelize.STRING,
      allowNull: false
    },

    state: {
      type: Sequelize.STRING,
      allowNull: false
    },

    neighborhood: {
      type: Sequelize.STRING,
      allowNull: false
    },

    zipCode: {
      type: Sequelize.STRING,
      allowNull: false,
      set(oldValue) {
        // eslint-disable-next-line no-useless-escape
        const newValue = oldValue.replace(/\D/gi, "");
        this.setDataValue("zipCode", newValue);
      }
    }
  });

  supProvider.associate = models => {
    supProvider.hasMany(models.supContact, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return supProvider;
};
