const Sequelize = require('sequelize')
const models = require('./models')

const postgresConfig = require('../config/database')

const env = process.env.NODE_ENV || 'development'
const config = postgresConfig[env]

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(
    `${process.env[config.use_env_variable]}?sslmode=require`,
    config
  )
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )
}

const modelInstances = models.map(model => model(sequelize))
modelInstances.forEach(
  modelInstance =>
    modelInstance.associate && modelInstance.associate(sequelize.models)
)

module.exports = sequelize
