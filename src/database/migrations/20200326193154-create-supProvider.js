module.exports = {
  up: (queryInterface, Sequelize) => {
    const supProvider = queryInterface.createTable("supProvider", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      razaoSocial: {
        type: Sequelize.STRING,
        allowNull: false
      },

      cnpj: {
        type: Sequelize.STRING,
        set(oldValue) {
          // eslint-disable-next-line no-useless-escape
          const newValue = oldValue.replace(/\.|-|\//gi, "");
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

      referencePoint: {
        type: Sequelize.STRING
      },

      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
        set(oldValue) {
          // eslint-disable-next-line no-useless-escape
          const newValue = oldValue.replace(/\.|-/gi, "");
          this.setDataValue("zipCode", newValue);
        }
      },

      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE
      }
    });

    return supProvider;
  },

  down: queryInterface => queryInterface.dropTable("supProvider")
};
