const R = require('ramda')

const TechnicianDomain = require('../../../domains/estoque/technician')
const database = require('../../../database')

const technicianDomain = new TechnicianDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const technician = await technicianDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(technician)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const technician = await technicianDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(technician)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const techinial = await technicianDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(techinial)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllTechnician = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const techinial = await technicianDomain.getAllTechnician({
      query,
      transaction
    })

    await transaction.commit()
    res.json(techinial)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getByIdTechnician = async (req, res, next) => {
  try {
    const user = await technicianDomain.getByIdTechnician(req.params.id)

    res.json(user)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  add,
  update,
  getAll,
  getAllTechnician,
  getByIdTechnician
}
