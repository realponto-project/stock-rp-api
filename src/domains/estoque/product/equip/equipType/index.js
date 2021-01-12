const R = require("ramda")

const database = require("../../../../../database")

const { FieldValidationError } = require("../../../../../helpers/errors")

const EquipType = database.model("equipType")
const User = database.model("user")

module.exports = class EquipModelDomain {
  async addType(bodyData, options = {}) {
    const { transaction = null } = options

    const equipType = R.omit(["id"], bodyData)

    const equipTypeNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      type: false,
      responsibleUser: false
    }
    const message = {
      type: "",
      responsibleUser: ""
    }

    let errors = false

    if (equipTypeNotHasProp("type") || !equipType.type) {
      errors = true
      field.type = true
      message.type = 'Por favor informar o "tipo de equipamento".'
    } else {
      const typeHasExist = await EquipType.findOne({ where: { type: equipType.type } })

      if (typeHasExist) {
        errors = true
        field.type = true
        message.type = "esse tipo de equipamento já esta cadastrado."
      }
    }

    if (equipTypeNotHasProp("responsibleUser")) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = "username não está sendo passado."
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction
      })

      if (!user) {
        errors = true
        field.responsibleUser = true
        message.responsibleUser = "username inválido."
      }
    } else {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = "username não pode ser nulo."
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const typeCreated = await EquipType.create(equipType, { transaction })

    const response = await EquipType.findByPk(typeCreated.id, { transaction })

    return response
  }

  async getAllType(options = {}) {
    const { transaction = null } = options

    const equipTypes = await EquipType.findAll({
      attributes: ["type"],
      order: [
        [
          "type",
          "ASC"
        ]
      ],
      transaction
    })

    if (equipTypes.length === 0) return []

    return equipTypes
  }
}
