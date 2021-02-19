const R = require('ramda')
const { pathOr, isEmpty, isNil } = require('ramda')
const bcrypt = require('bcrypt')

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
    let fieldsError = []
    const { transaction = null } = options
    const payload = {
      technician: pathOr(null, ['technician'], body),
      rows: pathOr(null, ['rows'], body),
      data: pathOr(null, ['data'], body),
      accessSecurity: pathOr(null, ['accessSecurity'], body),
    }
    
    for ( let key in payload) {
      if (!payload[key]) {
        fieldsError = [
          ...fieldsError,
          {
            field: key,
            message: `${key} cannot be null or undefined, field is required!`,
          }
        ]
      }
    }

    await payload.rows.forEach(async item => {
      const product = pathOr(null, ['produto'], item)
      const serial = pathOr(null, ['serial'], item)
      const amount = pathOr(null, ['amount'], item) 
      
      if (isNil(product)) {
        fieldsError = [
          ...fieldsError,
          {
            field: 'product',
            message: 'product cannot be null or undefined!',
          }
        ]
      }

      if (isNil(serial)) {
        fieldsError = [
          ...fieldsError,
          {
            field: 'serial',
            message: 'serial cannot be null or undefined!',
          }
        ]
      }

      if (isNil(amount)) {
        fieldsError = [
          ...fieldsError,
          {
            field: 'amount',
            message: 'amount cannot be null or undefined!',
          }
        ]
      }

      const tecnico = await Technician.findOne({ where: { name: payload.technician }})
      const produto = await Product.findOne({ where: { name: product }})
     
      if (!tecnico) {
        fieldsError = [
          ...fieldsError,
          {
            field: 'technician',
            message: 'cannot find technician!',
          }
        ]
      } 

      technicianReserve = await TechnicianReserve.findOne({
        where: {
          productId: produto.id,
          technicianId: tecnico.id,
          data:
            body.technician !== 'LABORATORIO'
              ? {
                  [Op.gte]: moment(body.data).startOf('day').toString(),
                  [Op.lte]: moment(body.data).endOf('day').toString()
                }
              : { [Op.eq]: null }
        },
        paranoid: false,
      })

      let technicianReserveId = null
      if (technicianReserve) {
        technicianReserveId = technicianReserve.id

        await technicianReserve.update(
          {
            amount: technicianReserve.amount + item.amount,
            amountAux: technicianReserve.amountAux + item.amount
          }, { transaction }
        )
      } else {
      
        const technicianReserveCreated = await TechnicianReserve.create(
          {
            productId: produto.id,
            technicianId: tecnico.id,
            data: payload.technician !== 'LABORATORIO' ? payload.data : null,
            amount: item.amount,
            amountAux: item.amount
          }, { transaction }
        )

        technicianReserveId = technicianReserveCreated.id       
      }

      const accessSecurity = (
        await bcrypt.hash(
          `{ "name": ${payload.technician}, "accessSecurity": ${payload.accessSecurity}, "createdAt":${moment()} }`, 10
        )
      )
      
      await Promise.all(item.osPartisIdArray.map(async (osPartItem) => {
        const osPartItemFound = await OsParts.findByPk(osPartItem)
        await osPartItemFound.update({
          prevAction: 'saida',
          technicianReserveId,
          reserved: true,
          accessSecurity,
        }, { transaction })

        osPartItemFound.reload()
        return osPartItemFound
      }))

     if (item.serial) {
      await Promise.all(item.serialNumbers.map(async (serialNumberItem) => {
        const serialNumberItemFound = await Equip.findOne({ where: { serialNumber }})
        await serialNumberItemFound.update({
          prevAction: 'saida',
          technicianReserveId,
          reserved: true
        }, { transaction })

        serialNumberItemFound.reload()
        return serialNumberItemFound
      }))
     }
    })
    
    if (!isEmpty(fieldsError)) {
      throw new FieldValidationError(fieldsError)
    }

    return ({
      statusCode: 200,
      message: 'reserva criada com sucesso!!!'
    })
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
      paranoid: false,
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
        paranoid: false,
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
          const { serialNumbers } = osPart

          await Promise.all(
            serialNumbers.map(async serialNumber => {
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
              add: { output: osPart.amount },
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
