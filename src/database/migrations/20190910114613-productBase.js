module.exports = {
  up: (queryInterface, Sequelize) => {
    const productBase = queryInterface.createTable("productBase", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      amount: {
        type: Sequelize.STRING,
        defautValue: "0",
      },

      available: {
        type: Sequelize.STRING,
        defautValue: "0",
      },

      analysis: {
        type: Sequelize.STRING,
        defautValue: "0",
      },

      preAnalysis: {
        type: Sequelize.STRING,
        defautValue: "0",
      },

      reserved: {
        type: Sequelize.STRING,
        defautValue: "0",
      },

      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE,
      },

      productId: {
        type: Sequelize.UUID,
        references: {
          model: "product",
          key: "id",
        },
        allowNull: false,
      },
      stockBaseId: {
        type: Sequelize.UUID,
        references: {
          model: "stockBase",
          key: "id",
        },
        allowNull: true,
      },
    });

    productBase.associate = (models) => {
      productBase.hasMany(models.equip);
      productBase.belongsTo(models.product, {
        foreignKey: {
          allowNull: false,
        },
      });
      productBase.belongsTo(models.stockBase, {
        foreignKey: {
          allowNull: false,
        },
      });
    };

    return productBase;
  },

  down: (queryInterface) => queryInterface.dropTable("productBase"),
};
