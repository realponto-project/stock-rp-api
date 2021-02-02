module.exports = {
  up: (queryInterface, Sequelize) => {
    const entrance = queryInterface.createTable('entrance', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      amountAdded: {
        type: Sequelize.STRING,
        allowNull: false
      },

      oldAmount: {
        type: Sequelize.STRING,
        allowNull: false
      },

      analysis: {
        type: Sequelize.BOOLEAN,
        defautValue: false
      },

      responsibleUser: {
        type: Sequelize.STRING,
        allowNull: false
      },

      stockBase: {
        type: Sequelize.ENUM(['ESTOQUE', 'EMPRESTIMO']),
        allowNull: false
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
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id'
        },
        allowNull: false
      },
      companyId: {
        type: Sequelize.UUID,
        references: {
          model: 'company',
          key: 'id'
        },
        allowNull: false
      }
    })

    return entrance
  },

  down: queryInterface => queryInterface.dropTable('entrance')
}
