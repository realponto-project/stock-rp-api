const R = require("ramda")

const ManufacturerDomain = require("../../../domains/suprimentos/manufacturer")
const database = require("../../../database")

const manufacturerDomain = new ManufacturerDomain()

const create = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const manufacturer = await manufacturerDomain.create(req.body, { transaction })

    await transaction.commit()
    res.json(manufacturer)
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

    const manufacturers = await manufacturerDomain.getAll({
      query,
      transaction
    })

    await transaction.commit()
    res.json(manufacturers)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const manufacturer = await manufacturerDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(manufacturer)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

module.exports = {
  create,
  getAll,
  update
}
