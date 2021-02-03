const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const moment = require('moment')
const jwt = require('jsonwebtoken')

module.exports = sequelize => {
  const user = sequelize.define(
    'user',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customized: {
        type: Sequelize.BOOLEAN,
        allowNull: false
        // defaultValue: false,
      },
      modulo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tecnico: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      responsibleUser: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      hooks: {
        beforeSave: async user => {
          console.log(user.password)
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10)
          }
        }
      }
    }
  )

  user.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password)
  }

  user.prototype.generateToken = jwt.sign(
    {
      id: this.id,
      iat: Math.floor(Date.now() / 1000) - 30,
      exp: Math.floor(moment().endOf('day')) / 1000
    },
    process.env.APP_SECRET
  )

  user.associate = models => {
    user.belongsTo(models.resources)
    user.belongsTo(models.technician)
    user.belongsTo(models.typeAccount)
  }

  return user
}
