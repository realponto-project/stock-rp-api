const R = require('ramda')

const database = require('../../../../database')

const formatQuery = require('../../../../helpers/lazyLoad')
const { FieldValidationError } = require('../../../../helpers/errors')

const Mark = database.model('mark')

module.exports = class MarkDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const mark = R.omit(['id'], bodyData)

    const markNotHasProp = prop => R.not(R.has(prop, mark))

    const field = {
      mark: false,
      responsibleUser: false
    }
    const message = {
      mark: '',
      responsibleUser: ''
    }

    let errors = false

    if (markNotHasProp('mark') || !mark.mark) {
      errors = true
      field.newMarca = true
      message.newMarca = 'Por favor informar a marca do markamento.'
    }

    const markHasExist = await Mark.findOne({
      where: { mark: mark.mark },
      transaction
    })

    if (markHasExist) {
      errors = true
      field.newMarca = true
      message.newMarca = 'Marca já está cadastrada.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const markCreated = await Mark.create(mark, { transaction })

    const response = await Mark.findByPk(markCreated.id, { transaction })

    return response
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { limit, offset, pageResponse, getWhere } = formatQuery(newQuery)

    const marks = await Mark.findAndCountAll({
      attributes: ['mark'],
      limit: query.total === null ? undefined : limit,
      order: [['mark', 'ASC']],
      offset,
      where: getWhere('mark'),
      transaction
    })

    const { rows, count } = marks

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count,
        rows: []
      }
    }

    const response = {
      page: pageResponse,
      show: R.min(limit, count),
      count,
      rows
    }

    return response
  }
}
