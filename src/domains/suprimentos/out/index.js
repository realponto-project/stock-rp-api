/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
const R = require('ramda')
const sgMail = require('@sendgrid/mail')
const { FieldValidationError } = require('../../../helpers/errors')
const database = require('../../../database')
const formatQuery = require('../../../helpers/lazyLoad')

const SupProduct = database.model('supProduct')
const SupOut = database.model('supOut')
const User = database.model('user')

module.exports = class SupOutDomain {
  async create(body, options = {}) {
    const { transaction = null } = options

    const supOut = R.omit(['id', 'authorized'], body)

    const notHasProp = prop => R.not(R.has(prop, supOut))

    let errors = false

    const field = {
      amount: false,
      solicitante: false,
      emailResp: false,
      emailSolic: false,
      supProductId: false,
      responsibleUser: false
    }

    const message = {
      amount: '',
      solicitante: '',
      emailResp: '',
      emailSolic: '',
      supProductId: '',
      responsibleUser: ''
    }

    if (notHasProp('amount')) {
      errors = true
      field.amount = true
      message.amount = 'amount cannot undefined'
    } else if (typeof supOut.amount !== 'number') {
      errors = true
      field.amount = true
      message.amount = 'amount already registered'
    }

    if (notHasProp('solicitante') || !supOut.solicitante) {
      errors = true
      field.solicitante = true
      message.solicitante = 'solicitante cannot null'
    }

    if (notHasProp('emailResp')) {
      errors = true
      field.emailResp = true
      message.emailResp = 'emailResp cannot undefined'
    } else if (
      supOut.emailResp !== '' &&
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supOut.emailResp)
    ) {
      errors = true
      field.emailResp = true
      message.emailResp = 'emailResp invalid'
    }

    if (notHasProp('emailSolic') || !supOut.emailSolic) {
      errors = true
      field.emailSolic = true
      message.emailSolic = 'emailSolic cannot null'
    } else if (
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supOut.emailSolic)
    ) {
      errors = true
      field.emailSolic = true
      message.emailSolic = 'emailSolic invalid'
    }

    let supProduct = null

    if (notHasProp('supProductId') || !supOut.supProductId) {
      errors = true
      field.supProductId = true
      message.supProductId = 'supProductId cannot null'
    } else {
      supProduct = await SupProduct.findByPk(supOut.supProductId, {
        transaction
      })
      if (!supProduct) {
        errors = true
        field.supProductId = true
        message.supProductId = 'SupProduct not found'
      } else if (supProduct.amount - supOut.amount < 0) {
        errors = true
        field.amount = true
        message.amount = 'amount invalid'
      }
    }

    if (notHasProp('responsibleUser') || !supOut.responsibleUser) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'responsibleUser cannot null.'
    } else if (
      !(await User.findOne({
        where: { username: supOut.responsibleUser },
        transaction
      }))
    ) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'responsibleUser invalid.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    if (supOut.emailResp !== '') supOut.emailResp = null

    await supProduct.update(
      { amount: supProduct.amount - supOut.amount },
      { transaction }
    )

    await sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to: supOut.emailSolic,
      // from: "jessi_leandro@hotmail.com",
      from: 'estoque@realponto.com.br',
      subject: 'Sending with Twilio SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: `
      <p>
      CONFIRMAÇÃO DE SAIDA PELO RESPONSAVEL ${supOut.responsibleUser} SOBRE A SOLICITAÇÃO E CONFIRMAÇÃO DE RETIRADADOS DOS ITENS:
      </p>
      <strong>Item: </strong> ${supProduct.name}
      <br>
      <strong>Quantidade: </strong>${supOut.amount}
      <p>
      CONFORME SOLICITADO POR ${supOut.solicitante}, ESTANDO CIENTE SOBRE AS RETIRADAS DOS MESMOS EM SUA RESPONSABILIDADE.
      </p>
      </>
      `
    }
    await sgMail
      .send(msg)
      .then(resp => {})
      .catch(err => {})

    if (supOut.emailResp) {
      msg.to = supOut.emailResp

      await sgMail
        .send(msg)
        .then(resp => {})
        .catch(err => {})
    }

    const response = await SupOut.create(supOut, { transaction })

    return response
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const supOuts = await SupOut.findAndCountAll({
      where: getWhere('supOut'),
      include: [{ model: SupProduct, where: getWhere('supProduct') }],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
      transaction
    })

    const { rows, count } = supOuts

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
}
