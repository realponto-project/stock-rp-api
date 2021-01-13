const R = require('ramda')
const moment = require('moment')
const Sequelize = require('sequelize')
const database = require('../../../../database')

const Technician = database.model('technician')
const Product = database.model('product')
const TechnicianReserve = database.model('technicianReserve')
const Equip = database.model('equip')
const OsParts = database.model('osParts')
const Os = database.model('os')
const ProductBase = database.model('productBase')
const { FieldValidationError } = require('../../../../helpers/errors')

const OsDomain = require('../os')

const osDomain = new OsDomain()
const formatQuery = require('../../../../helpers/lazyLoad')

const { Op } = Sequelize

class ReservaTecnicoDomain {
  async create(body, options = {}) {
    const { transaction = null } = options

    const reservaTecnicoNotHasProp = prop => R.not(R.has(prop, body))

    const field = { technician: false }

    const message = { technician: '' }

    let errors = false

    let technicianId = ''

    if (reservaTecnicoNotHasProp('data')) {
      field.data = true
      message.data = 'data cannot undefined'
      errors = true
    }

    if (reservaTecnicoNotHasProp('technician') || !body.technician) {
      field.technician = true
      message.technician = 'technician cannot null'
      errors = true
    } else {
      const tecnico = await Technician.findOne({
        where: { name: body.technician },
        transaction
      })

      if (!tecnico) {
        field.technician = true
        message.technician = 'técnico inválido'
        errors = true
      } else {
        technicianId = tecnico.id
      }
    }

    if (reservaTecnicoNotHasProp('rows') || !body.rows) {
      field.rows = true
      message.rows = 'rows cannot null'
      errors = true
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const { rows } = body

    await Promise.all(
      rows.map(async row => {
        const rowNotHasProp = prop => R.not(R.has(prop, row))

        let productId = ''

        if (rowNotHasProp('produto') || !row.produto) {
          throw new FieldValidationError([{ field, message }])
        } else {
          const produto = await Product.findOne({
            where: { name: row.produto },
            transaction
          })

          if (produto) {
            productId = produto.id
          } else {
            throw new FieldValidationError([{ field, message }])
          }
        }

        if (rowNotHasProp('amount') || !row.amount) {
          throw new FieldValidationError([{ field, message }])
        }

        if (rowNotHasProp('serial')) {
          throw new FieldValidationError([{ field, message }])
        }

        const technicianReserve = await TechnicianReserve.findOne({
          where: {
            productId,
            technicianId,
            data:
              body.technician !== 'LABORATORIO'
                ? {
                    [Op.gte]: moment(body.data).startOf('day').toString(),
                    [Op.lte]: moment(body.data).endOf('day').toString()
                  }
                : { [Op.gte]: moment('01/01/2019').startOf('day').toString() }
          },
          transaction
        })

        let technicianReserveId = null

        if (technicianReserve) {
          technicianReserveId = technicianReserve.id

          await technicianReserve.update(
            {
              amount: technicianReserve.amount + row.amount,
              amountAux: technicianReserve.amountAux + row.amount
            },
            { transaction }
          )
        } else {
          const technicianReserveCreated = await TechnicianReserve.create(
            {
              productId,
              technicianId,
              data: body.technician !== 'LABORATORIO' ? body.data : null,
              amount: row.amount,
              amountAux: row.amount
            },
            { transaction }
          )

          technicianReserveId = technicianReserveCreated.id
        }

        await Promise.all(
          row.osPartisIdArray.map(async id => {
            const osPart = await OsParts.findByPk(id, { transaction })

            if (osPart.technicianReserveId) {
              throw new FieldValidationError([{ field, message }])
            }

            await osPart.update({ technicianReserveId }, { transaction })
          })
        )

        if (row.serial) {
          if (!rowNotHasProp('serialNumbers')) {
            if (row.serialNumbers) {
              await Promise.all(
                row.serialNumbers.map(async item => {
                  const { serialNumber } = item

                  const equip = await Equip.findOne({
                    where: { serialNumber },
                    transaction
                  })

                  if (!equip) {
                    throw new FieldValidationError([{ field, message }])
                  }

                  await equip.update(
                    { technicianReserveId, reserved: true },
                    { transaction }
                  )
                })
              )
            } else {
              throw new FieldValidationError([{ field, message }])
            }
          }
        }
      })
    )
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const { getWhere } = formatQuery(newQuery)

    const technicianReserves = await TechnicianReserve.findAll({
      where: getWhere('technicianReserve'),
      // paranoid: false,
      include: [
        { model: Technician, where: getWhere('technician') },
        { model: Product }
      ],
      transaction
    })

    const formatted = R.map(async item => {
      const equips = await Equip.findAll({
        where: { technicianReserveId: item.id },
        paranoid: false,
        transaction
      })

      return {
        id: item.product.id,
        amount: item.amount,
        os: '-',
        tecnico: item.technician.name,
        produto: item.product.name,
        serial: item.product.serial,
        category: item.product.category,

        serialNumber:
          item.product.category === 'equipamento' &&
          item.product.serial &&
          equips.length > 0
            ? equips[0].serialNumber
            : undefined,
        serialNumbers: equips.map(equip => ({
          serialNumber: equip.serialNumber
        }))
      }
    })

    // eslint-disable-next-line no-return-await
    return await Promise.all(formatted(technicianReserves))
  }

  async getAllForReturn(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const { getWhere } = formatQuery(newQuery)

    const technicianReserves = await TechnicianReserve.findAll({
      where: getWhere('technicianReserve'),
      include: [
        { model: Technician, where: getWhere('technician') },
        { model: Product }
      ],
      transaction
    })

    const rows = []

    const formatted = R.map(async item => {
      const equips = await Equip.findAll({
        include: [
          {
            model: OsParts,
            include: [{ model: Os, paranoid: false }],
            paranoid: false
          }
        ],
        through: { paranoid: false },
        where:
          newQuery.osPartId === undefined
            ? {
                technicianReserveId: item.id
                // prevAction: null,
              }
            : {
                technicianReserveId: item.id,
                prevAction: null,
                osPartId: null
              },
        transaction
      })

      if (item.product.serial) {
        equips.forEach(equip => {
          rows.push({
            // technicianReserveId: item.technicianReserveId,
            prevAction: equip.prevAction,
            technicianReserveId: item.id,
            createdAt: item.createdAt,
            id: item.product.id,
            amount: 1,
            os: equip.osPartId ? equip.osPart.o.os : '-',
            tecnico: item.technician.name,
            produto: item.product.name,
            serial: item.product.serial,
            category: item.product.category,
            serialNumber: equip.serialNumber,
            serialNumbers: [equip.serialNumber],
            osPartId: equip.osPartId
          })
        })
        return { id: null }
      }

      return {
        createdAt: item.createdAt,
        id: item.product.id,
        amount: item.amountAux,
        os: '-',
        tecnico: item.technician.name,
        produto: item.product.name,
        serial: item.product.serial,
        category: item.product.category,
        serialNumber:
          item.product.category === 'equipamento' && item.product.serial
            ? equips[0].serialNumber
            : undefined,
        serialNumbers: equips.map(equip => ({
          serialNumber: equip.serialNumber
        }))
      }
    })

    const osParts = await OsParts.findAll({
      where: {
        [Op.or]: {
          return: { [Op.ne]: '0' },
          output: { [Op.ne]: '0' },
          missOut: { [Op.ne]: '0' }
        },
        statusExpeditionId: { [Op.ne]: '18b37c3a-1a1f-4b7f-8f8a-2f2f7dc6724a' }
      },
      include: [
        {
          model: Os,
          required: true,
          where: getWhere('os'),
          include: [
            {
              model: Technician,
              where: getWhere('technician')
            }
          ]
          // paranoid: false,
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product,
              where: getWhere('product')
            }
          ],
          required: true
        }
      ],
      // paranoid: false,
      transaction
    })

    const formatedProducts = R.map(async item => {
      if (item.productBase.product.serial) return { id: null }

      return {
        technicianReserveId: item.technicianReserveId,
        amount: parseInt(item.amount, 10),
        return: parseInt(item.return, 10),
        output: parseInt(item.output, 10),
        missOut: parseInt(item.missOut, 10),
        os: item.o.os,
        tecnico: item.o.technician.name,
        produto: item.productBase.product.name,
        id: item.productBase.product.id,
        osPartId: item.id,
        serial: item.productBase.product.serial,
        category: item.productBase.product.category,
        serialNumbers: []
      }
    })

    return [
      ...(await Promise.all(formatted(technicianReserves))),
      ...rows,
      ...(await Promise.all(formatedProducts(osParts)))
    ].filter(item => item.id)
  }

  async associarEquipParaOsPart(body, options = {}) {
    const { transaction = null } = options

    const bodyNotHasProp = prop => R.not(R.has(prop, body))

    if (bodyNotHasProp('tecnico') || !body.tecnico) {
      throw new FieldValidationError([
        { field: { tecnico: true }, message: 'tecnico cannot null' }
      ])
    } else if (
      !(await Technician.findOne({
        where: { name: body.tecnico },
        transaction
      }))
    ) {
      throw new FieldValidationError([
        {
          field: { tecnico: true },
          message: 'tecnico invalid'
        }
      ])
    }

    if (bodyNotHasProp('prevAction') || !body.prevAction) {
      throw new FieldValidationError([
        {
          field: { prevAction: true },
          message: 'prevAction cannot null'
        }
      ])
    }

    if (bodyNotHasProp('serialNumber') || !body.serialNumber) {
      throw new FieldValidationError([
        {
          field: { serialNumber: true },
          message: 'serialNumber cannot null'
        }
      ])
    } else if (
      !(await Equip.findOne({
        where: { serialNumber: body.serialNumber },
        transaction
      }))
    ) {
      throw new FieldValidationError([
        {
          field: { serialNumber: true },
          message: 'serialNumber invalid'
        }
      ])
    }

    if (bodyNotHasProp('technicianReserveId') || !body.technicianReserveId) {
      throw new FieldValidationError([
        {
          field: { technicianReserveId: true },
          message: 'technicianReserveId cannot null'
        }
      ])
    } else if (
      !(await TechnicianReserve.findByPk(body.technicianReserveId, {
        transaction
      }))
    ) {
      throw new FieldValidationError([
        {
          field: { technicianReserveId: true },
          message: 'technicianReserveId invalid'
        }
      ])
    }

    if (bodyNotHasProp('oId') || !body.oId) {
      throw new FieldValidationError([
        { field: { oId: true }, message: 'oId cannot null' }
      ])
    } else if (!(await Os.findByPk(body.oId, { transaction }))) {
      throw new FieldValidationError([
        {
          field: { technicianReserveId: true },
          message: 'technicianReserveId invalid'
        }
      ])
    }

    const equip = await Equip.findOne({
      where: { serialNumber: body.serialNumber },
      transaction
    })

    const osPart = await OsParts.findOne({
      where: { productBaseId: equip.productBaseId, oId: body.oId },
      transaction
    })

    await equip.update(
      { osPartId: osPart.id, prevAction: body.prevAction },
      { transaction }
    )
  }

  async associarEquipsParaOsPart(body, options = {}) {
    const { transaction = null } = options

    const bodyNotHasProp = prop => R.not(R.has(prop, body))

    if (bodyNotHasProp('technicianId') || !body.technicianId) {
      throw new FieldValidationError([
        {
          field: { technicianId: true },
          message: 'technicianId cannot null'
        }
      ])
    } else if (
      !(await Technician.findByPk(body.technicianId, { transaction }))
    ) {
      throw new FieldValidationError([
        {
          field: { technicianId: true },
          message: 'tecnico invalid'
        }
      ])
    }

    if (bodyNotHasProp('osParts') || !body.osParts) {
      throw new FieldValidationError([
        {
          field: { osParts: true },
          message: 'osParts cannot null'
        }
      ])
    }

    const { osParts } = body
    await Promise.all(
      osParts.map(async osPart => {
        const { serial, osPartId } = osPart

        if (serial) {
          const { serialNumersSelects } = osPart

          await Promise.all(
            serialNumersSelects.map(async serialNumber => {
              const equip = await Equip.findOne({
                where: { serialNumber },
                transaction
              })

              await equip.update(
                { osPartId, prevAction: 'saida' },
                { transaction }
              )
            })
          )
        } else {
          await osDomain.output(
            {
              osPartId: osPart.osPartId,
              add: { output: osPart.quantidadeSaida },
              serialNumberArray: null
            },
            { transaction }
          )
        }
      })
    )
  }
}

module.exports = new ReservaTecnicoDomain()
