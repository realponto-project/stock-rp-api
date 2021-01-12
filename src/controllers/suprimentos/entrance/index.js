const R = require("ramda")

const SupEntranceDomain = require("../../../domains/suprimentos/entrance")
const database = require("../../../database")

const supEntranceDomain = new SupEntranceDomain()

const create = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const entrance = await supEntranceDomain.create(req.body, { transaction })

    await transaction.commit()
    res.json(entrance)
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

    const entrances = await supEntranceDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(entrances)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  create,
  getAll
}
