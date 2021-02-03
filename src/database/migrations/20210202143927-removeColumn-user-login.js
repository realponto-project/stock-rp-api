'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('user', 'loginId', { transaction })
      await queryInterface.removeColumn('session', 'loginId', { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'session',
        'loginId',
        {
          type: Sequelize.UUID,
          references: {
            model: 'login',
            key: 'id'
          },
          allowNull: true
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'user',
        'loginId',
        {
          type: Sequelize.UUID,
          references: {
            model: 'login',
            key: 'id'
          },
          allowNull: true
        },
        { transaction }
      )
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
