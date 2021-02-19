require('dotenv').config()

module.exports = {
  development: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 1000000,
      idle: 10000
    },
    define: {
      freezeTableName: true,
      paranoid: true,
      timestamps: true
    }
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: true
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    url: process.env.DATABASE_URL,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}
