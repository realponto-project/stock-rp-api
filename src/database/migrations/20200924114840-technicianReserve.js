module.exports = {
  up: (queryInterface, Sequelize) => {
    const technicianReserve = queryInterface.createTable("technicianReserve", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      amountAux: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      data: { defaultValue: Sequelize.NOW, type: Sequelize.DATE },

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

      technicianId: {
        type: Sequelize.UUID,
        references: {
          model: "technician",
          key: "id",
        },
        allowNull: false,
      },

      productId: {
        type: Sequelize.UUID,
        references: {
          model: "product",
          key: "id",
        },
        allowNull: true,
      },
    });

    return technicianReserve;
  },

  down: (queryInterface) => queryInterface.dropTable("technicianReserve"),
};
