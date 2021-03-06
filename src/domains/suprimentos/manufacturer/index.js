const R = require('ramda')
const { FieldValidationError } = require('../../../helpers/errors')
const database = require('../../../database')
const formatQuery = require('../../../helpers/lazyLoad')

const Manufacturer = database.model('manufacturer')

module.exports = class ManufacturerDomain {
  async create(body, options = {}) {
    const { transaction = null } = options

    const manufacturer = body

    const notHasProp = prop => R.not(R.has(prop, manufacturer))

    let errors = false

    const field = { name: false }

    const message = { name: '' }

    if (notHasProp('name') || !manufacturer.name) {
      errors = true
      field.name = true
      message.name = 'name cannot null'
    } else if (
      await Manufacturer.findOne({
        where: { name: manufacturer.name },
        transaction
      })
    ) {
      errors = true
      field.name = true
      message.name = 'name already registered'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await Manufacturer.create(manufacturer, { transaction })

    return response
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const manufacturers = await Manufacturer.findAndCountAll({
      where: getWhere('manufacturer'),
      order: [['name', 'ASC']],
      limit: query.total === null ? undefined : limit,
      offset,
      transaction
    })

    const { rows, count } = manufacturers

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count,
        rows: []
      }
    }

    return {
      page: pageResponse,
      show: R.min(count, limit),
      count,
      rows
    }
  }

  async update(body, options = {}) {
    const { transaction = null } = options
    const manufacturer = R.omit(['id'], body)

    const oldManufacturer = await Manufacturer.findByPk(body.id, {
      transaction
    })

    if (!oldManufacturer) {
      throw new FieldValidationError({
        field: { id: true },
        message: { id: 'invalid id' }
      })
    }

    const notHasProp = prop => R.not(R.has(prop, manufacturer))

    let errors = false

    const field = { name: false }

    const message = { name: '' }

    if (notHasProp('name') || !manufacturer.name) {
      errors = true
      field.name = true
      message.name = 'name cannot null'
    } else if (
      (await Manufacturer.findOne({
        where: { name: manufacturer.name },
        transaction
      })) &&
      oldManufacturer.name !== manufacturer.name
    ) {
      errors = true
      field.name = true
      message.name = 'name already registered'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await oldManufacturer.update(manufacturer, { transaction })

    return response
  }
}
