const R = require("ramda")

const SupProviderDomain = require("../../../domains/suprimentos/provider")
const database = require("../../../database")

const supProviderDomain = new SupProviderDomain()

const create = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const provider = await supProviderDomain.create(req.body, { transaction })

    await transaction.commit()
    res.json(provider)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const providers = await supProviderDomain.getAll({
      query,
      transaction
    })

    await transaction.commit()
    res.json(providers)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const provider = await supProviderDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(provider)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getByIdProvider = async (req, res, next) => {
  try {
    const provider = await supProviderDomain.getByIdProvider(req.params.id)

    res.json(provider)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  create,
  getAll,
  getByIdProvider,
  update,
}
