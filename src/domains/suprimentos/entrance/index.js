const R = require("ramda")
const { FieldValidationError } = require("../../../helpers/errors")
const formatQuery = require("../../../helpers/lazyLoad")
const database = require("../../../database")

const SupEntrance = database.model("supEntrance")
const SupProduct = database.model("supProduct")
const SupProvider = database.model("supProvider")
const User = database.model("user")

module.exports = class SupEntranceDomain {
  async create(body, options = {}) {
    const { transaction = null } = options

    const supEntrance = R.omit(["total"], body)

    const notHasProp = prop => R.not(R.has(prop, supEntrance))

    let errors = false

    const field = {
      amount: false,
      priceUnit: false,
      discount: false,
      supProviderId: false,
      supProductId: false,
      responsibleUser: false
    }

    const message = {
      amount: "",
      priceUnit: "",
      discount: "",
      supProviderId: "",
      supProductId: "",
      responsibleUser: ""
    }

    if (notHasProp("amount")) {
      errors = true
      field.amount = true
      message.amount = "amount cannot undefined"
    } else if (typeof supEntrance.amount !== "number") {
      errors = true
      field.amount = true
      message.amount = "amount invalid"
    }

    if (notHasProp("priceUnit")) {
      errors = true
      field.priceUnit = true
      message.priceUnit = "priceUnit cannot undefined"
    } else if (typeof supEntrance.priceUnit !== "number") {
      errors = true
      field.priceUnit = true
      message.priceUnit = "priceUnit invalid"
    }

    if (notHasProp("discount")) {
      errors = true
      field.discount = true
      message.discount = "discount cannot undefined"
    } else if (typeof supEntrance.discount !== "number") {
      errors = true
      field.discount = true
      message.discount = "discount invalid"
    }

    if (notHasProp("supProviderId") || !supEntrance.supProviderId) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "supProviderId cannot null"
    } else if (
      !(await SupProvider.findByPk(supEntrance.supProviderId, { transaction }))
    ) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "SupProvider not found"
    }

    let supProduct = null

    if (notHasProp("supProductId") || !supEntrance.supProductId) {
      errors = true
      field.supProductId = true
      message.supProductId = "supProductId cannot null"
    } else {
      supProduct = await SupProduct.findByPk(supEntrance.supProductId, { transaction })
      if (!supProduct) {
        errors = true
        field.supProductId = true
        message.supProductId = "SupProvider not found"
      }
    }

    if (notHasProp("responsibleUser") || !supEntrance.responsibleUser) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = "responsibleUser cannot null."
    } else if (
      !(await User.findOne({
        where: { username: supEntrance.responsibleUser },
        transaction
      }))
    ) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = "responsibleUser invalid."
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }
    const { amount, priceUnit, discount } = supEntrance

    const total = amount * priceUnit - discount

    await supProduct.update(
      { amount: amount + supProduct.amount },
      { transaction }
    )

    const response = await SupEntrance.create({ ...supEntrance, total }, { transaction })

    return response
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const supEntrances = await SupEntrance.findAndCountAll({
      where: getWhere("supEntrance"),
      include: [
        { model: SupProduct, where: getWhere("supProduct") },
        { model: SupProvider }
      ],
      order: [
        [
          "createdAt",
          "ASC"
        ]
      ],
      limit,
      offset,
      transaction
    })

    const { rows, count } = supEntrances

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
