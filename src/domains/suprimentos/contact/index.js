/* eslint-disable no-useless-escape */
const R = require("ramda")
const { FieldValidationError } = require("../../../helpers/errors")
const database = require("../../../database")

const SupProvider = database.model("supProvider")
const SupContact = database.model("supContact")

module.exports = class SupContactDomain {
  async create(body, options = {}) {
    const { transaction = null } = options

    const supContact = body

    const notHasProp = prop => R.not(R.has(prop, supContact))

    let errors = false

    const field = {
      name: false,
      telphone: false,
      email: false,
      supProviderId: false
    }

    const message = {
      name: "",
      telphone: "",
      email: "",
      supProviderId: ""
    }

    if (notHasProp("name") || !supContact.name) {
      errors = true
      field.name = true
      message.name = "name cannot null"
    }

    if (notHasProp("telphone") || !supContact.telphone) {
      errors = true
      field.telphone = true
      message.telphone = "telphone cannot null"
    }

    if (notHasProp("email") || !supContact.email) {
      errors = true
      field.email = true
      message.email = "email cannot null"
    } else if (
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supContact.email)
    ) {
      errors = true
      field.email = true
      message.email = "email invalid"
    }

    if (notHasProp("supProviderId") || !supContact.supProviderId) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "supProviderId cannot null"
    } else if (
      !(await SupProvider.findByPk(supContact.supProviderId, { transaction }))
    ) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "SupProvider not found"
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await SupContact.create(supContact, { transaction })

    return response
  }

  async update(body, options = {}) {
    const { transaction = null } = options

    const supContact = R.omit("id", body)

    const oldSupContact = await SupContact.findByPk(body.id, { transaction })

    if (!oldSupContact) {
      throw new FieldValidationError({
        field: { id: true },
        message: { id: "invalid id" }
      })
    }

    const notHasProp = prop => R.not(R.has(prop, supContact))

    let errors = false

    const field = {
      name: false,
      telphone: false,
      email: false,
      supProviderId: false
    }

    const message = {
      name: "",
      telphone: "",
      email: "",
      supProviderId: ""
    }

    if (notHasProp("name") || !supContact.name) {
      errors = true
      field.name = true
      message.name = "name cannot null"
    }

    if (notHasProp("telphone") || !supContact.telphone) {
      errors = true
      field.telphone = true
      message.telphone = "telphone cannot null"
    }

    if (notHasProp("email") || !supContact.email) {
      errors = true
      field.email = true
      message.email = "email cannot null"
    } else if (
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supContact.email)
    ) {
      errors = true
      field.email = true
      message.email = "email invalid"
    }

    if (notHasProp("supProviderId") || !supContact.supProviderId) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "supProviderId cannot null"
    } else if (
      !(await SupProvider.findByPk(supContact.supProviderId, { transaction }))
    ) {
      errors = true
      field.supProviderId = true
      message.supProviderId = "SupProvider not found"
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const respose = await oldSupContact.update(supContact, { transaction })

    return respose
  }
}
