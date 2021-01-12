/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Equip = database.model('equip')
const Product = database.model('product')
const Technician = database.model('technician')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')
const ReservaInterno = database.model('reservaInterno')
const ReservaInternoParts = database.model('reservaInternoParts')

module.exports = class ReservaInternoDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const reserveInterno = R.omit(['id', 'reserveInternoParts'], bodyData)

    const reserveInternoNotHasProp = prop => R.not(R.has(prop, reserveInterno))

    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      razaoSocial: false,
      data: false,
      reserveInternoParts: false,
      technicianId: false
    }

    const message = {
      razaoSocial: '',
      data: '',
      reserveInternoParts: '',
      technicianId: ''
    }

    let errors = false

    if (
      reserveInternoNotHasProp('razaoSocial') ||
      !reserveInterno.razaoSocial
    ) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Digite o nome ou razão social.'
    }

    if (reserveInternoNotHasProp('date') || !reserveInterno.date) {
      errors = true
      field.data = true
      message.data = 'Por favor a data de atendimento.'
    }

    if (!bodyHasProp('reserveInternoParts') || !bodyData.reserveInternoParts) {
      errors = true
      field.reserveInternoParts = true
      message.reserveInternoParts = 'Deve haver ao menos um peça associada.'
    }

    if (
      reserveInternoNotHasProp('technicianId') ||
      !reserveInterno.technicianId
    ) {
      errors = true
      field.technician = true
      message.technician = 'Por favor o ID do tecnico'
    } else {
      const { technicianId } = bodyData
      const technicianExist = await Technician.findByPk(technicianId, {
        transaction
      })

      if (!technicianExist) {
        errors = true
        field.technician = true
        message.technician = 'Técnico não encomtrado'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const reservaInternoCreated = await ReservaInterno.create(reserveInterno, {
      transaction
    })

    const { reserveInternoParts } = bodyData

    const reserveInternoPartsCreatedPromises = reserveInternoParts.map(
      async item => {
        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [
            { model: StockBase, required: true },
            { model: Product, required: true }
          ],
          transaction
        })

        if (!productBase) {
          field.productBase = true
          message.productBase = 'este produto não const na base de estoque'
          throw new FieldValidationError([{ field, message }])
        }

        const { product } = productBase

        if (!product) {
          field.peca = true
          message.peca = 'produto foi encontrado'
          throw new FieldValidationError([{ field, message }])
        }

        const reserveInternoPartsForCreate = {
          ...item,
          productId: product.id,
          reservaInternoId: reservaInternoCreated.id
        }

        const reserveInternoPartsCreated = await ReservaInternoParts.create(
          reserveInternoPartsForCreate,
          { transaction }
        )

        if (product.serial) {
          const { serialNumberArray } = item

          if (serialNumberArray.length !== parseInt(item.amount, 10)) {
            errors = true
            field.serialNumbers = true
            message.serialNumbers =
              'quantidade adicionada nãop condiz com a quantidade de números de série.'
          }

          console.log(serialNumberArray)
          if (serialNumberArray.length > 0) {
            await serialNumberArray.map(async serialNumber => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: item.productBaseId
                },
                transaction
              })
              if (!equip) {
                errors = true
                field.serialNumber = true
                message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`
                throw new FieldValidationError([{ field, message }])
              }
            })

            await serialNumberArray.map(async serialNumber => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: item.productBaseId
                },
                transaction
              })

              await equip.update(
                {
                  ...equip,
                  reservaInternoPartsId: reserveInternoPartsCreated.id,
                  reserved: true
                },
                { transaction }
              )
              await equip.destroy({ transaction })
            })
          }
        }

        const productUpdate = {
          ...productBase,
          available: (
            parseInt(productBase.available, 10) - parseInt(item.amount, 10)
          ).toString(),
          amount: (
            parseInt(productBase.amount, 10) - parseInt(item.amount, 10)
          ).toString()
        }

        if (
          parseInt(productUpdate.available, 10) < 0 ||
          parseInt(productUpdate.amount, 10) < 0
        ) {
          field.productUpdate = true
          message.productUpdate = 'Número negativo não é valido'
          throw new FieldValidationError([{ field, message }])
        }

        await productBase.update(productUpdate, { transaction })
      }
    )

    await Promise.all(reserveInternoPartsCreatedPromises)

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await ReservaInterno.findByPk(reservaInternoCreated.id, {
      include: [{ model: Product }],
      transaction
    })

    return response
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: 'createdAt',
      acendent: true,
      direction: 'DESC'
    }
    const { query = null, transaction = null } = options
    const newQuery = Object.assign({}, query)
    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const reservaInterno = await ReservaInterno.findAndCountAll({
      where: getWhere('reservaInterno'),
      include: [
        {
          model: Technician,
          where: getWhere('technician')
        },
        { model: Product }
      ],
      order: [[inicialOrder.field, inicialOrder.direction]],
      limit,
      offset,
      transaction
    })

    const { rows, count } = reservaInterno

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count,
        rows: []
      }
    }

    const formatProduct = products =>
      R.map(async item => {
        const { reservaInternoParts } = item
        const { amount } = reservaInternoParts
        const resp = {
          name: item.name,
          serial: item.serial,
          amount
        }

        return resp
      }, products)

    const formatData = R.map(async item => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        date: item.date,
        formatedDate: moment(item.date).format('L'),
        technician: item.technician.name,
        technicianId: item.technicianId,
        createdAt: item.createdAt,
        products: [...(await Promise.all(formatProduct(item.products)))]
      }
      return resp
    })

    const reservaInternoList = await Promise.all(formatData(rows))

    const response = {
      page: pageResponse,
      show: R.min(count, limit),
      count,
      rows: reservaInternoList
    }
    return response
  }
}
