const Sequelize = require('sequelize')
const models = require('./models')
const postgresConfig = require('../config/database')
const environmentDataBase = process.env.DB_PRD_ENVIRONMENT ? 'production' : 'development'

const sequelize = new Sequelize(postgresConfig[environmentDataBase])

const modelInstances = models.map(model => model(sequelize))
modelInstances.forEach(
  modelInstance =>
    modelInstance.associate && modelInstance.associate(sequelize.models)
)

module.exports = sequelize
