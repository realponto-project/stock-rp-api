/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
const Sequelize = require('sequelize')
const Cnpj = require('@fnando/cnpj/es')
const Cpf = require('@fnando/cpf/es')

const { Op } = Sequelize

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')
const { FieldValidationError } = require('../../../../helpers/errors')

const Os = database.model('os')
const OsParts = database.model('osParts')
const Product = database.model('product')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')
const Technician = database.model('technician')
const Equip = database.model('equip')
const KitOut = database.model('kitOut')
const KitParts = database.model('kitParts')
const StatusExpedition = database.model('statusExpedition')
const TechnicianReserve = database.model('technicianReserve')

const { Op: operators } = Sequelize

module.exports = class OsDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id', 'osParts'], bodyData)

    const reserveNotHasProp = prop => R.not(R.has(prop, reserve))
    const bodyHasProp = prop => R.has(prop, bodyData)
    const HasProp = (prop, obj) => R.has(prop, obj)

    const field = {
      razaoSocial: false,
      data: false,
      cnpj: false,
      date: false,
      osParts: false,
      technician: false
    }
    const message = {
      razaoSocial: '',
      data: '',
      cnpj: '',
      date: '',
      osParts: '',
      technician: ''
    }

    let errors = false

    if (reserveNotHasProp('razaoSocial') || !reserve.razaoSocial) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Por favor a razão social.'
    }

    if (!reserveNotHasProp('cnpj')) {
      if (!reserve.cnpj) {
        errors = true
        field.cnpj = true
        message.cnpj = 'Por favor informar o cnpj.'
      } else {
        const cnpj = reserve.cnpj.replace(/\D/g, '')

        if (!Cnpj.isValid(cnpj)) {
          errors = true
          field.cnpj = true
          message.cnpj = 'O cnpj informado não é válido.'
        }
      }
    }

    if (!reserveNotHasProp('cpf')) {
      if (!reserve.cpf) {
        errors = true
        field.cpf = true
        message.cpf = 'Por favor informar o cpf.'
      } else {
        const cpf = reserve.cpf.replace(/\D/g, '')

        if (!Cpf.isValid(cpf)) {
          errors = true
          field.cpf = true
          message.cpf = 'O cpf informado não é válido.'
        }
      }
    }

    if (reserveNotHasProp('date') || !reserve.date) {
      errors = true
      field.data = true
      message.data = 'Por favor a data de atendimento.'
    }

    if (!bodyHasProp('osParts') || !bodyData.osParts) {
      errors = true
      field.osParts = true
      message.osParts = 'Deve haver ao menos um peça associada.'
    }

    if (reserveNotHasProp('technicianId') || !reserve.technicianId) {
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

    console.log(
      R.length(
        R.filter(
          ({ status }) => status === 'ECOMMERCE' || status === 'RECEPÇÃO',
          bodyData.osParts
        )
      ),
      R.length(bodyData.osParts)
    )

    const lengthListWithStatusEcommerce = R.length(
      R.filter(
        ({ status }) => status === 'ECOMMERCE' || status === 'RECEPÇÃO',
        bodyData.osParts
      )
    )

    if (
      lengthListWithStatusEcommerce !== R.length(bodyData.osParts) &&
      lengthListWithStatusEcommerce !== 0
    ) {
      errors = true
      field.status = true
      message.status =
        'Staus de reserva não deve ser misturado com status de baixa direta'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const reserveAll = await Os.findAll({ paranoid: false, transaction })

    reserve.os = (reserveAll.length + 1).toString()
    reserve.cnpj = reserve.cnpj ? reserve.cnpj.replace(/\D/g, '') : null
    reserve.cpf = reserve.cpf ? reserve.cpf.replace(/\D/g, '') : null

    const reserveCreated = await Os.create(reserve, { transaction })

    if (bodyHasProp('osParts')) {
      const { osParts } = bodyData

      const osPartsCreattedPromises = osParts.map(async item => {
        if (!HasProp('status', item) || !item.status) {
          field.status = true
          message.status = 'status cannot null'
          throw new FieldValidationError([{ field, message }])
        }

        const status = await StatusExpedition.findOne({
          where: { status: item.status },
          transaction
        })

        if (!status) {
          field.status = true
          message.status = 'status inválid'

          throw new FieldValidationError([{ field, message }])
        }

        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [{ model: Product }],
          transaction
        })

        const osPartsCreatted = {
          ...item,
          statusExpeditionId: status.id,
          oId: reserveCreated.id
        }

        if (!productBase) {
          errors = true
          field.peca = true
          message.peca = 'produto não oconst a na base de dados'
        }
        if (errors) {
          throw new FieldValidationError([{ field, message }])
        }

        const osPartCreated = await OsParts.create(osPartsCreatted, {
          transaction
        })

        if (item.status === 'CONSERTO') {
          if (R.not(R.has('serialNumbers', item)) || !item.serialNumbers) {
            errors = true
            field.serialNumbers = true
            message.serialNumbers = 'serialNumbers cannot null'
          } else {
            const productBaseConserto = await ProductBase.findOne({
              where: { productId: productBase.product.id, stockBaseId: null },
              transaction
            })

            await Promise.all(
              item.serialNumbers.map(async serialNumber => {
                await Equip.create(
                  {
                    serialNumber,
                    reserved: true,
                    osPartId: osPartCreated.id,
                    productBaseId: productBaseConserto.id
                  },
                  { transaction }
                )
              })
            )
          }
        }
        if (item.status !== 'CONSERTO') {
          if (
            productBase.product.serial &&
            (productBase.product.category !== 'peca' ||
              item.status === 'ECOMMERCE' ||
              item.status === 'RECEPÇÃO')
          ) {
            const { serialNumberArray } = item

            if (serialNumberArray.length !== parseInt(item.amount, 10)) {
              errors = true
              field.serialNumbers = true
              message.serialNumbers =
                'quantidade adicionada nãop condiz com a quantidade de números de série.'
            }

            if (serialNumberArray.length > 0) {
              await serialNumberArray.map(async serialNumber => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false
                    // productBaseId: productBase.id,
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
                    reserved: false
                    // productBaseId: productBase.id,
                  },
                  transaction
                })
                if (item.status === 'ECOMMERCE' || item.status === 'RECEPÇÃO') {
                  await equip.update(
                    {
                      osPartId: osPartCreated.id,
                      productBaseId: productBase.id
                    },
                    { transaction }
                  )
                  await equip.destroy({ transaction })
                } else {
                  await equip.update(
                    {
                      osPartId: osPartCreated.id,
                      reserved: true,
                      productBaseId: productBase.id,
                      prevAction: 'saida'
                    },
                    { transaction }
                  )
                }
              })
            }
          }

          let productBaseUpdate = {}

          if (item.status === 'ECOMMERCE' || item.status === 'ECOMMERCE') {
            productBaseUpdate = {
              available: (
                parseInt(productBase.available, 10) - parseInt(item.amount, 10)
              ).toString(),
              amount: (
                parseInt(productBase.amount, 10) - parseInt(item.amount, 10)
              ).toString()
            }
            await osPartCreated.update(
              { output: osPartCreated.amount },
              { transaction }
            )

            await osPartCreated.destroy({ transaction })
          } else {
            productBaseUpdate = {
              available: (
                parseInt(productBase.available, 10) - parseInt(item.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)
              ).toString()
            }
          }

          if (
            parseInt(productBaseUpdate.amount, 10) < 0 ||
            parseInt(productBaseUpdate.available, 10) < 0
          ) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          await productBase.update(productBaseUpdate, { transaction })
        }
      })
      await Promise.all(osPartsCreattedPromises)
    }
    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    if (
      R.length(
        R.filter(
          ({ status }) => status === 'ECOMMERCE' || status === 'RECEPÇÃO',
          bodyData.osParts
        )
      ) > 0
    ) {
      await reserveCreated.destroy({ transaction })
    }

    const response = await Os.findByPk(reserveCreated.id, {
      include: [{ model: ProductBase }, { model: Technician }],
      transaction
    })

    return response
  }

  async delete(osId, options = {}) {
    const { transaction = null } = options

    const field = { os: false }
    const message = { os: '' }

    const os = await Os.findByPk(osId, { transaction })

    if (os) {
      const osParts = await OsParts.findAll({
        where: { oId: osId },
        transaction
      })

      const osPartsPromise = osParts.map(async item => {
        if (item.productBaseId) {
          const productBase = await ProductBase.findByPk(item.productBaseId, {
            include: [Product],
            transaction
          })

          const equips = await Equip.findAll({
            where: { osPartId: item.id },
            transaction
          })

          const equipUpdatePromise = equips.map(async equip => {
            await equip.update(
              {
                ...equip,
                reserved: false,
                prevAction: null
              },
              { transaction }
            )
          })

          await Promise.all(equipUpdatePromise)
          const productBaseUpdate = {
            ...productBase,
            available: (
              parseInt(productBase.available, 10) + parseInt(item.amount, 10)
            ).toString(),
            reserved: (
              parseInt(productBase.reserved, 10) - parseInt(item.amount, 10)
            ).toString()
          }
          if (
            parseInt(productBaseUpdate.amount, 10) < 0 ||
            parseInt(productBaseUpdate.available, 10) < 0
          ) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          await productBase.update(productBaseUpdate, { transaction })
        }

        await item.destroy({ transaction })
      })

      await Promise.all(osPartsPromise)

      await os.destroy({ transaction })
    } else {
      field.os = true
      message.os = 'Os não encontrada'

      throw new FieldValidationError([{ field, message }])
    }

    const osDeleted = await Os.findByPk(osId, { transaction })

    if (!osDeleted) {
      return 'sucesso'
    }
    return 'erro'
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id'], bodyData)
    const oldReserve = await Os.findByPk(bodyData.id, { transaction })

    const reserveOs = { ...oldReserve }

    const HasProp = (prop, obj) => R.has(prop, obj)
    const reserveHasProp = prop => R.has(prop, reserve)

    const technicianUpdated = oldReserve.technicianId !== reserve.technicianId

    const field = { date: false }
    const message = { date: '' }

    let errors = false

    if (reserveHasProp('date')) {
      if (!reserve.date) {
        errors = true
        field.date = true
        message.date = 'date não pode ser nula.'
      } else {
        reserveOs.date = reserve.date
      }
    }

    if (reserveHasProp('technicianId')) {
      const technician = await Technician.findByPk(reserve.technicianId, {
        transaction
      })
      if (!technician) {
        errors = true
        field.technicianId = true
        message.technicianId = 'Técnico não foi encontrado.'
      } else reserveOs.technicianId = reserve.technicianId
    }

    if (reserveHasProp('osParts')) {
      const { osParts } = reserve

      let osPartsAll = await OsParts.findAll({
        where: {
          oId: bodyData.id,
          missOut: '0',
          return: '0',
          output: '0'
        },
        attributes: ['id', 'productBaseId'],
        transaction
      })

      const osPartsUpdatePromises = osParts.map(async item => {
        if (R.prop('id', item)) {
          const osPartsReturn = await OsParts.findByPk(item.id, {
            include: [{ model: Os }, { model: ProductBase }],
            transaction
          })

          if (technicianUpdated) {
            if (
              osPartsReturn.return !== '0' ||
              osPartsReturn.output !== '0' ||
              osPartsReturn.missOut !== '0'
            ) {
              throw new FieldValidationError([
                {
                  field: { message: true },
                  message: {
                    message:
                      'não é possivel editar a OS pois há itens que já foram liberados'
                  }
                }
              ])
            }

            const technicianReserve = await TechnicianReserve.findOne({
              where: {
                technicianId: osPartsReturn.o.technicianId,
                productId: osPartsReturn.productBase.productId,
                data:
                  osPartsReturn.o.technicianId !==
                  '0c451d60-f837-4a9e-b8a6-cab41a788133'
                    ? {
                        [Op.gte]: moment(osPartsReturn.o.date)
                          .startOf('day')
                          .toString(),
                        [Op.lte]: moment(osPartsReturn.o.date)
                          .endOf('day')
                          .toString()
                      }
                    : {
                        [Op.gte]: moment('01/01/2019').startOf('day').toString()
                      }
              },
              transaction
            })

            if (technicianReserve) {
              const equips = await Equip.findAll({
                where: { technicianReserveId: technicianReserve.id },
                transaction
              })

              await Promise.all(
                equips.map(async equip => {
                  await equip.update(
                    { reserved: false, technicianReserveId: null },
                    { transaction }
                  )
                })
              )

              await technicianReserve.update(
                {
                  amount:
                    technicianReserve.amount -
                    parseInt(osPartsReturn.amount, 10),
                  amountAux:
                    technicianReserve.amountAux -
                    parseInt(osPartsReturn.amount, 10)
                },
                { transaction }
              )

              throw new FieldValidationError()
            }
          }

          osPartsAll = await osPartsAll.filter(itemOld => {
            if (itemOld.id !== item.id) {
              return itemOld.id
            }
            return null
          })

          const productBase = await ProductBase.findByPk(
            osPartsReturn.productBaseId,
            { include: [Product], transaction }
          )

          if (productBase) {
            const productBaseUpdate = {
              ...productBase,
              available: (
                parseInt(productBase.available, 10) +
                parseInt(osPartsReturn.amount, 10) -
                parseInt(item.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) -
                parseInt(osPartsReturn.amount, 10) +
                parseInt(item.amount, 10)
              ).toString()
            }

            if (
              parseInt(productBaseUpdate.amount, 10) < 0 ||
              parseInt(productBaseUpdate.available, 10) < 0
            ) {
              field.productBaseUpdate = true
              message.productBaseUpdate = 'Número negativo não é valido'
              throw new FieldValidationError([{ field, message }])
            }

            const osPartsUpdate = {
              ...osPartsReturn,
              amount: item.amount
            }

            await osPartsReturn.update(osPartsUpdate, { transaction })
            await productBase.update(productBaseUpdate, { transaction })
          }
        } else {
          if (!HasProp('status', item) || !item.status) {
            field.status = true
            message.status = 'status cannot null'
            throw new FieldValidationError([{ field, message }])
          }

          const status = await StatusExpedition.findOne({
            where: { status: item.status },
            transaction
          })

          if (!status) {
            field.status = true
            message.status = 'status inválid'
            throw new FieldValidationError([{ field, message }])
          }

          const osPartsCreatted = {
            ...item,
            statusExpeditionId: status.id,
            oId: bodyData.id
          }

          const osPartCreated = await OsParts.create(osPartsCreatted, {
            transaction
          })

          const productBase = await ProductBase.findByPk(item.productBaseId, {
            include: [
              {
                model: Product,
                attributes: ['serial']
              }
            ],
            transaction
          })

          if (!productBase) {
            field.peca = true
            message.peca = 'produto não oconst a na base de dados'
            throw new FieldValidationError([{ field, message }])
          }

          if (
            productBase.product.serial &&
            productBase.product.category !== 'peca'.category
          ) {
            const { serialNumberArray } = item

            if (serialNumberArray.length !== parseInt(item.amount, 10)) {
              errors = true
              field.serialNumbers = true
              message.serialNumbers =
                'quantidade adicionada não condiz com a quantidade de números de série.'
            }

            if (serialNumberArray.length > 0) {
              await serialNumberArray.map(async serialNumber => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false,
                    productBaseId: productBase.id
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
                    productBaseId: productBase.id
                  },
                  transaction
                })

                await equip.update(
                  {
                    ...equip,
                    osPartId: osPartCreated.id,
                    reserved: true,
                    prevAction: 'saida'
                  },
                  { transaction }
                )
              })
            }
          }

          const productBaseUpdate = {
            ...productBase,
            available: (
              parseInt(productBase.available, 10) - parseInt(item.amount, 10)
            ).toString(),
            reserved: (
              parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)
            ).toString()
          }

          if (
            parseInt(productBaseUpdate.amount, 10) < 0 ||
            parseInt(productBaseUpdate.available, 10) < 0
          ) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          await productBase.update(productBaseUpdate, { transaction })
        }
      })
      await Promise.all(osPartsUpdatePromises)

      if (osPartsAll.length > 0) {
        const osPartsdeletePromises = osPartsAll.map(async item => {
          const osPartDelete = await OsParts.findByPk(item.id, {
            include: [{ model: Os }, { model: ProductBase }],
            transaction
          })

          const technicianReserve = await TechnicianReserve.findOne({
            where: {
              technicianId: osPartDelete.o.technicianId,
              productId: osPartDelete.productBase.productId,
              data:
                osPartDelete.o.technicianId !==
                '0c451d60-f837-4a9e-b8a6-cab41a788133'
                  ? {
                      [Op.gte]: moment(osPartDelete.o.date)
                        .startOf('day')
                        .toString(),
                      [Op.lte]: moment(osPartDelete.o.date)
                        .endOf('day')
                        .toString()
                    }
                  : {
                      [Op.gte]: moment('01/01/2019').startOf('day').toString()
                    }
            },
            transaction
          })

          if (technicianReserve) {
            throw new FieldValidationError([
              {
                field,
                message
              }
            ])
          }

          const equips = await Equip.findAll({
            where: { osPartId: item.id },
            transaction
          })

          const equipUpdatePromise = equips.map(async equip => {
            await equip.update(
              {
                ...equip,
                reserved: false,
                osPartId: null,
                prevAction: null
              },
              { transaction }
            )
          })

          await Promise.all(equipUpdatePromise)

          const productBase = await ProductBase.findByPk(item.productBaseId, {
            transaction
          })

          if (productBase) {
            const productBaseUpdate = {
              ...productBase,
              available: (
                parseInt(productBase.available, 10) +
                parseInt(osPartDelete.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) -
                parseInt(osPartDelete.amount, 10)
              ).toString()
            }

            if (
              parseInt(productBaseUpdate.amount, 10) < 0 ||
              parseInt(productBaseUpdate.available, 10) < 0
            ) {
              field.productBaseUpdate = true
              message.productBaseUpdate = 'Número negativo não é valido'
              throw new FieldValidationError([{ field, message }])
            }

            await productBase.update(productBaseUpdate, { transaction })
          }

          osPartDelete.destroy({ transaction })
        })

        await Promise.all(osPartsdeletePromises)
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    await oldReserve.update(reserveOs, { transaction })

    const response = await Os.findByPk(oldReserve.id, { transaction })

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
    const newOrder = query && query.order ? query.order : inicialOrder

    if (newOrder.acendent) {
      newOrder.direction = 'DESC'
    } else {
      newOrder.direction = 'ASC'
    }

    // const required = R.prop("required", query) === undefined
    //   ? true
    //   : R.prop("required", query)
    const paranoid =
      R.prop('paranoid', query) === undefined
        ? false
        : R.prop('paranoid', query)

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const whereOs = R.has('cnpj', getWhere('os'))
      ? {
          ...getWhere('os'),
          cnpj: { [Op.or]: [getWhere('os').cnpj, { [Op.eq]: null }] },
          cpf: { [Op.or]: [getWhere('os').cnpj, { [Op.eq]: null }] }
        }
      : getWhere('os')

    const count = await Os.count({
      where: whereOs,
      include: [
        {
          model: Technician,
          where: getWhere('technician')
        }
      ],
      limit: 0,
      paranoid,
      transaction
    })

    console.log(count)
    console.log(getWhere('osParts'))
    // console.log(getWhere('osPart'))
    const os = await Os.findAndCountAll({
      where: whereOs,
      include: [
        {
          model: Technician,
          where: getWhere('technician')
        },
        {
          model: ProductBase,
          required: false,
          include: [
            {
              model: Product,
              where: getWhere('product')
            }
          ],
          through: {
            paranoid,
            where: getWhere('osParts')
          }
        }
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      paranoid,
      transaction
    })

    console.log(os.count)

    const { rows } = os

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: os.count,
        rows: []
      }
    }

    const formatDateFunct = date => {
      moment.locale('pt-br')
      const formatDate = moment(date).format('L')
      const formatHours = moment(date).format('LT')
      const dateformated = `${formatDate} ${formatHours}`
      return dateformated
    }

    const formatKitOut = R.map(item => {
      const resp = {
        name: `#${item.kitPart.productBase.product.name}`,
        amount: '-',
        output: item.amount,
        missOut: '-',
        return: '-'
      }
      return resp
    })

    const findKitOuts = async osProps => {
      const kitOuts = await KitOut.findAll({
        where: { os: osProps },
        include: [
          {
            model: KitParts,
            include: [
              {
                model: ProductBase,
                include: [{ model: Product }]
              }
            ]
          }
        ],
        transaction
      })

      return formatKitOut(kitOuts)
    }

    const notDelet = []

    const formatProduct = (productBases, index) =>
      R.map(async item => {
        const { osParts } = item
        const { amount, output, missOut } = osParts
        const status = await StatusExpedition.findByPk(
          osParts.statusExpeditionId,
          {
            attributes: ['status'],
            transaction
          }
        )

        notDelet[index] =
          output !== '0' ||
          missOut !== '0' ||
          osParts.return !== '0' ||
          !!notDelet[index]
        let equips = []

        // eslint-disable-next-line prefer-destructuring
        const serial = item.product.serial

        if (
          item.osParts.statusExpeditionId !==
          '18b37c3a-1a1f-4b7f-8f8a-2f2f7dc6724a'
        ) {
          if (serial) {
            equips = await Equip.findAll({
              attributes: ['serialNumber', 'productBaseId', 'deletedAt'],
              where: { osPartId: osParts.id, productBaseId: item.id },
              paranoid: false,
              transaction
            })
          }
        } else {
          notDelet[index] =
            parseInt(amount, 10) !== item.osParts.serialNumbers.length ||
            notDelet[index]
        }

        const quantMax =
          parseInt(amount, 10) -
          parseInt(osParts.return, 10) -
          parseInt(output, 10) -
          parseInt(missOut, 10)

        const resp = {
          technicianReserve: !!osParts.technicianReserveId,
          serialNumbers: equips,
          name: item.product.name,
          serial: item.product.serial,
          id: osParts.id,
          amount,
          output,
          missOut,
          return: osParts.return,
          quantMax,
          status: status && status.status
        }

        return resp
      }, productBases)

    const mapIndexed = R.addIndex(R.map)

    const formatData = mapIndexed(async (item, index) => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj ? item.cnpj : item.cpf,
        date: item.date,
        formatedDate: moment(item.date).format('L'),
        technician: item.technician.name,
        technicianId: item.technicianId,
        os: item.os,
        createdAt: formatDateFunct(item.createdAt),
        products: [
          ...(await Promise.all(
            formatProduct(item.productBases, index, item.os)
          )),
          ...(await findKitOuts(item.os))
        ],
        notDelet:
          (item.productBases &&
            item.productBases.filter(
              productBase => productBase.osParts.deletedAt !== null
            ).length !== 0) ||
          notDelet[index]
      }

      return resp
    })

    const osList = await Promise.all(formatData(rows))

    let show = limit
    if (count < show) {
      show = count
    }

    const response = {
      page: pageResponse,
      show,
      count,
      rows: osList
    }

    return response
  }

  async getOsByOs(os, options = {}) {
    const { transaction = null } = options

    const formatDateFunct = date => {
      moment.locale('pt-br')
      const formatDate = moment(date)
      return formatDate
    }

    const osReturn = await Os.findOne({
      where: { os },
      include: [
        { model: Technician },
        {
          model: ProductBase,
          include: [{ model: Product }, { model: StockBase }]
        }
      ],
      transaction
    })

    if (!osReturn) {
      return {
        razaoSocial: '',
        cnpj: '',
        technician: '',
        reserve: []
      }
    }

    const formatedReserve = R.map(item => {
      const resp = {
        stockBase: item.stockBase.stockBase,
        amount: item.osParts.amount,
        nomeProdutoCarrinho: item.product.name,
        productId: item.productId
      }
      return resp
    })

    const response = {
      razaoSocial: osReturn.razaoSocial,
      cnpj: osReturn.cnpj,
      data: formatDateFunct(osReturn.date),
      technician: osReturn.technician.name,
      reserve: formatedReserve(osReturn.productBases)
    }

    return response
  }

  async output(bodyData, options = {}) {
    const { transaction = null } = options
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      osPartId: false,
      add: false
    }
    const message = {
      osPartId: '',
      add: ''
    }

    let errors = false

    if (bodyDataNotHasProp('osPartId') || !bodyData.osPartId) {
      errors = true
      field.osPartId = true
      message.osPartId = 'Informe o id do produto.'
    } else {
      const osPart = await OsParts.findByPk(bodyData.osPartId, { transaction })

      if (!osPart) {
        errors = true
        field.osPartId = true
        message.osPartId = 'produto não foi encontrada.'
      }
    }

    if (bodyDataNotHasProp('add') || !bodyData.add) {
      errors = true
      field.add = true
      message.add = 'Por favor a quantidade'
    }
    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const osPart = await OsParts.findByPk(bodyData.osPartId, {
      include: [{ model: Os }],
      transaction
    })

    const { add } = bodyData

    const key = R.keys(add)[0]

    const value = R.prop([key], add)

    const total =
      parseInt(osPart.amount, 10) -
      parseInt(osPart.output, 10) -
      parseInt(osPart.missOut, 10) -
      parseInt(osPart.return, 10)

    if (parseInt(value, 10) > total) {
      errors = true
      field.add = true
      message.add = 'quantidade adicionada exede o limite'
      throw new FieldValidationError([{ field, message }])
    }

    const productBase = await ProductBase.findByPk(osPart.productBaseId, {
      include: [
        {
          model: Product,
          attributes: ['serial']
        }
      ],
      transaction
    })

    if (productBase) {
      const technicianReserve = await TechnicianReserve.findOne({
        where: {
          productId: productBase.productId,
          technicianId: osPart.o.technicianId,
          data:
            osPart.o.technicianId !== '0c451d60-f837-4a9e-b8a6-cab41a788133'
              ? {
                  [Op.gte]: moment(osPart.o.date).startOf('day').toString(),
                  [Op.lte]: moment(osPart.o.date).endOf('day').toString()
                }
              : null
        },
        paranoid: false,
        transaction
      })

      await technicianReserve.update(
        { amountAux: technicianReserve.amountAux - value },
        { transaction }
      )
    }

    const osPartUpdate = {
      ...osPart,
      [key]: (parseInt(value, 10) + parseInt(osPart[key], 10)).toString()
    }

    await osPart.update(osPartUpdate, { transaction })

    const response = await OsParts.findByPk(bodyData.osPartId, { transaction })

    return response
  }

  async returnOutput(body, options) {
    const { transaction = null } = options

    let error = false
    let osPart = null
    let technicianReserve = null

    if (R.not(R.has('osPartId', body || !body.osPartId))) {
      error = true
    } else {
      osPart = await OsParts.findByPk(body.osPartId, { transaction })
      if (!osPart) {
        error = true
      }
    }

    if (
      R.not(R.has('technicianReserveId', body || !body.technicianReserveId))
    ) {
      error = true
    } else {
      technicianReserve = await TechnicianReserve.findByPk(
        body.technicianReserveId,
        { transaction }
      )
      if (!technicianReserve) {
        error = true
      }
    }
    if (error) {
      throw new FieldValidationError()
    }

    if (R.has('serialNumber', body)) {
      const { serialNumber } = body
      const equip = await Equip.findOne({
        where: { serialNumber },
        transaction
      })

      if (!equip) {
        throw new FieldValidationError()
      }

      await equip.update({ osPartId: null, prevAction: null }, { transaction })
    }

    const { output, missOut, return: retorno } = osPart

    await technicianReserve.update(
      {
        amountAux:
          technicianReserve.amountAux +
          parseInt(retorno, 10) +
          parseInt(output, 10) +
          parseInt(missOut, 10)
      },
      { transaction }
    )

    await osPart.update(
      {
        return: '0',
        output: '0',
        missOut: '0'
      },
      { transaction }
    )
  }

  async getAllOsPartsByParams(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere, limit, pageResponse } = formatQuery(newQuery)

    const products = await ProductBase.findAndCountAll({
      include: [
        {
          model: Os,
          required: true,
          where: getWhere('os'),
          // paranoid: false,
          // through: {
          //   paranoid: false,
          // },
          include: [
            { model: Technician, where: getWhere('technician') },
            {
              model: OsParts,
              include: [{ model: TechnicianReserve, paranoid: false }]
            }
          ]
        },
        { model: Product }
      ],
      transaction
    })

    const equipamentos = []

    const formatedProducts = R.map(async item => {
      if (item.product.serial) {
        if (item.product.category === 'peca') {
          let amount = 0
          let osPartisIdArray = []
          item.os.forEach(os => {
            osPartisIdArray = !os.osParts.technicianReserveId
              ? [...osPartisIdArray, os.osParts.id]
              : osPartisIdArray
            amount =
              amount +
              parseInt(os.osParts.amount, 10) -
              parseInt(os.osParts.return, 10) -
              parseInt(os.osParts.output, 10) -
              parseInt(os.osParts.missOut, 10)

            if (os.osPart.technicianReserve) {
              amount -= os.osPart.technicianReserve.amountAux
            }
          })

          const equips = await Equip.findAll({
            include: [
              {
                model: TechnicianReserve,
                where: {
                  ...getWhere('technicianReserve'),
                  productId: item.product.id,
                  technicianId: item.os[0].technician.id
                }
              }
            ],
            transaction
          })

          amount -= equips.length
          if (amount) {
            return {
              id: item.product.id,
              amount,
              osPartisIdArray,
              os: '-',
              tecnico: item.os[0].technician.name,
              produto: item.product.name,
              serial: item.product.serial
            }
          }
        }

        await Promise.all(
          item.os.map(async os => {
            const equips = await Equip.findAll({
              where: { osPartId: os.osParts.id },
              transaction
            })

            equips.forEach(equip => {
              if (!equip.technicianReserveId) {
                equipamentos.push({
                  id: item.product.id,
                  amount: 1,
                  osPartisIdArray: [os.osParts.id],
                  os: os.os,
                  tecnico: item.os[0].technician.name,
                  produto: item.product.name,
                  serial: item.product.serial,
                  serialNumber: equip.serialNumber
                })
              }
            })
          })
        )
        return { id: null }
      }

      let amount = 0
      let osPartisIdArray = []

      item.os.forEach(os => {
        osPartisIdArray = !os.osParts.technicianReserveId
          ? [...osPartisIdArray, os.osParts.id]
          : osPartisIdArray
        amount = !os.osParts.technicianReserveId
          ? amount + parseInt(os.osParts.amount, 10)
          : amount
      })

      const technicianReserve = await TechnicianReserve.findOne({
        attributes: ['amount', 'productId', 'technicianId', 'createdAt'],
        where: {
          data: {
            [Op.gte]: moment(item.os[0].date).startOf('day').toString(),
            [Op.lte]: moment(item.os[0].date).endOf('day').toString()
          },
          productId: item.product.id,
          technicianId: item.os[0].technician.id
        },
        transaction
      })

      if (technicianReserve) {
        amount -= technicianReserve.amount
      }

      if (amount) {
        return {
          id: item.product.id,
          osPartisIdArray,
          amount,
          os: '-',
          tecnico: item.os[0].technician.name,
          produto: item.product.name,
          serial: item.product.serial
        }
      }
      return { id: null }
    })

    const rows = await Promise.all(formatedProducts(products.rows))

    return {
      rows: [...rows.filter(item => item.id), ...equipamentos],
      count: products.count,
      page: pageResponse,
      show: R.min(limit, products.count)
    }
  }

  async getAllOsPartsByParamsForReturn(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere } = formatQuery(newQuery)

    const os = await Os.findAll({
      where: getWhere('os'),
      include: [
        { model: Technician, where: getWhere('technician'), paranoid: false },
        {
          model: ProductBase,
          include: [
            { model: StockBase, where: { stockBase: 'ESTOQUE' } },
            {
              model: Product,
              where: { name: newQuery.filters.product.specific.name }
            }
          ]
        }
      ],
      transaction
    })

    const formatedProducts = R.map(async item => {
      let quant = 0
      await Promise.all(
        item.productBases.map(async productBase => {
          const {
            osParts: { amount, missOut, output, return: retorno }
          } = productBase
          const equips = await Equip.findAll({
            where: { osPartId: productBase.osParts.id },
            transaction
          })

          quant =
            quant +
            parseInt(amount, 10) -
            parseInt(missOut, 10) -
            parseInt(output, 10) -
            parseInt(retorno, 10) -
            equips.length
        })
      )
      if (quant === 0) return { oId: null }
      return {
        // osPartId:
        oId: item.id,
        os: item.os,
        razaoSocial: item.razaoSocial
      }
    })

    const rows = await Promise.all(formatedProducts(os))

    return { rows: rows.filter(item => item.oId) }
  }

  async getAllOsParts(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { getWhere, limit, pageResponse } = formatQuery(newQuery)

    let where = {}

    if (R.has('or', newQuery) && newQuery.or) {
      where = {
        [Op.or]: {
          return: { [Op.ne]: '0' },
          output: { [Op.ne]: '0' },
          missOut: { [Op.ne]: '0' }
        }
      }
    }

    const osParts = await OsParts.findAll({
      where,
      // paranoid: false,
      include: [
        { model: TechnicianReserve, required: true, paranoid: false },
        {
          model: Os,
          required: true,
          where: getWhere('os'),
          include: [{ model: Technician, where: getWhere('technician') }],
          paranoid: false
        },
        {
          model: ProductBase,
          include: [{ model: Product, where: getWhere('product') }],
          required: true
        }
      ],
      paranoid: !!newQuery.paranoid,
      transaction
    })

    const formatedProducts = R.map(async item => ({
      amount: parseInt(item.amount, 10),
      return: parseInt(item.return, 10),
      output: parseInt(item.output, 10),
      missOut: parseInt(item.missOut, 10),
      razaoSocial: item.o.razaoSocial,
      os: item.o.os,
      tecnico: item.o.technician.name,
      produto: item.productBase.product.name,
      id: item.productBase.product.id,
      osPartId: item.id,
      serial: item.productBase.product.serial
    }))

    const rows = await Promise.all(formatedProducts(osParts))

    return {
      rows: [...rows.filter(item => item.id)],
      count: osParts.length,
      page: pageResponse,
      show: R.min(limit, osParts.length)
    }
  }

  async finalizarCheckout(bodyData, options = {}) {
    const { transaction = null } = options

    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    const convertForInt = prop => parseInt(prop, 10)

    let errors = false
    let technicianReserve = null
    let osPart = null

    const field = {
      technicianReserveId: false,
      osPartId: false
    }

    const message = {
      technicianReserveId: '',
      osPartId: ''
    }

    if (
      bodyDataNotHasProp('technicianReserveId') ||
      !bodyData.technicianReserveId
    ) {
      field.technicianReserveId = true
      message.technicianReserveId = 'technicianReserveId cannot null'
      errors = true
    } else {
      technicianReserve = await TechnicianReserve.findByPk(
        bodyData.technicianReserveId,
        {
          paranoid: false,
          transaction
        }
      )

      if (!technicianReserve) {
        field.technicianReserveId = true
        message.technicianReserveId = 'technicianReserveId invalid'
        errors = true
      }
    }

    if (bodyDataNotHasProp('osPartId') || !bodyData.osPartId) {
      field.osPartId = true
      message.osPartId = 'osPartId cannot null'
      errors = true
    } else {
      osPart = await OsParts.findByPk(bodyData.osPartId, { transaction })

      if (!osPart) {
        field.osPartId = true
        message.osPartId = 'osPartId invalid'
        errors = true
      }
    }

    if (bodyDataNotHasProp('serial')) {
      field.serial = true
      message.serial = 'serial cannot null'
      errors = true
    } else if (bodyData.serial) {
      if (bodyDataNotHasProp('serialNumber') || !bodyData.serialNumber) {
        field.serialNumber = true
        message.serialNumber = 'serialNumber cannot null'
        errors = true
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    if (bodyData.serial) {
      console.log(JSON.parse(JSON.stringify(technicianReserve)))

      await technicianReserve.update(
        { amountAux: technicianReserve.amountAux - 1 },
        { transaction }
      )

      if (
        osPart.statusExpeditionId !== '18b37c3a-1a1f-4b7f-8f8a-2f2f7dc6724a'
      ) {
        const productBase = await ProductBase.findByPk(osPart.productBaseId, {
          transaction
        })

        const { serialNumber } = bodyData

        const equip = await Equip.findOne({
          where: { serialNumber },
          transaction
        })

        const { return: retorno, missOut, output } = osPart

        switch (bodyData.prevAction) {
          case 'retorno':
            await osPart.update(
              { return: (convertForInt(retorno) + 1).toString() },
              { transaction }
            )
            await equip.update(
              {
                technicianReserveId: null,
                osPartId: null,
                reserved: false,
                prevAction: null
              },
              { transaction }
            )
            await productBase.update(
              {
                reserved: (convertForInt(productBase.reserved) - 1).toString(),
                available: (convertForInt(productBase.available) + 1).toString()
              },
              { transaction }
            )
            break
          case 'saida':
            await equip.update(
              {
                technicianReserveId: null,
                reserved: false,
                prevAction: null
              },
              { transaction }
            )

            await equip.destroy({ transaction })
            await osPart.update(
              { output: (convertForInt(output) + 1).toString() },
              { transaction }
            )
            await productBase.update(
              {
                reserved: (convertForInt(productBase.reserved) - 1).toString(),
                amount: (convertForInt(productBase.amount) - 1).toString()
              },
              { transaction }
            )
            break
          case 'perda':
            await equip.update({ osPartId: null }, { transaction })
            await equip.destroy({ transaction })
            await osPart.update(
              { missOut: (convertForInt(missOut) + 1).toString() },
              { transaction }
            )
            await productBase.update(
              {
                reserved: (convertForInt(productBase.reserved) - 1).toString(),
                amount: (convertForInt(productBase.amount) - 1).toString()
              },
              { transaction }
            )
            break
          default:
            return null
        }

        if (
          convertForInt(osPart.return) +
            convertForInt(osPart.missOut) +
            convertForInt(osPart.output) ===
          convertForInt(osPart.amount)
        ) {
          await osPart.destroy({ transaction })

          const osParts = await OsParts.findAll({
            where: { oId: osPart.oId },
            transaction
          })

          if (osParts.length === 0) {
            const os = await Os.findByPk(osPart.oId, { transaction })

            await os.destroy({ transaction })
          }
        }
      } else {
        await osPart.update(
          {
            output: (convertForInt(osPart.output) + 1).toString(),
            serialNumbers: osPart.serialNumbers.filter(
              item => item !== bodyData.serialNumber
            ),
            outSerialNumbers: osPart.outSerialNumbers
              ? [...osPart.outSerialNumbers, bodyData.serialNumber]
              : [bodyData.serialNumber]
          },
          { transaction }
        )
        const { serialNumber } = bodyData

        const equip = await Equip.findOne({
          where: { serialNumber },
          transaction
        })

        await equip.destroy({ transaction })

        if (
          convertForInt(osPart.amount) ===
          convertForInt(osPart.return) +
            convertForInt(osPart.missOut) +
            convertForInt(osPart.output)
        ) {
          await osPart.destroy({ transaction })

          const osParts = await OsParts.findAll({
            where: { oId: osPart.oId },
            transaction
          })

          if (osParts.length === 0) {
            const os = await Os.findByPk(osPart.oId, { transaction })

            await os.destroy({ transaction })
          }
        }
      }

      if (technicianReserve.amountAux === 0) {
        await technicianReserve.destroy({ transaction })
      }
    } else {
      if (
        technicianReserve.amountAux !== 0 ||
        convertForInt(osPart.amount) !==
          convertForInt(osPart.return) +
            convertForInt(osPart.missOut) +
            convertForInt(osPart.output)
      ) {
        throw new FieldValidationError([{ field, message }])
      }
      await technicianReserve.destroy({ transaction })

      const productBase = await ProductBase.findByPk(osPart.productBaseId, {
        transaction
      })

      await productBase.update(
        {
          reserved: (
            convertForInt(productBase.reserved) - convertForInt(osPart.amount)
          ).toString(),
          amount: (
            convertForInt(productBase.amount) -
            convertForInt(osPart.output) -
            convertForInt(osPart.missOut)
          ).toString(),
          available: (
            convertForInt(productBase.available) + convertForInt(osPart.return)
          ).toString()
        },
        { transaction }
      )

      await osPart.destroy({ transaction })

      const osParts = await OsParts.findAll({
        where: { oId: osPart.oId },
        transaction
      })

      if (osParts.length === 0) {
        const os = await Os.findByPk(osPart.oId, { transaction })

        await os.destroy({ transaction })
      }
    }
    return true
  }

  async deleteOsPart(query, options = {}) {
    const { transaction } = options

    const technicianReserve = await TechnicianReserve.findByPk(
      query.technicianReserveId,
      { transaction }
    )

    const convertForInt = prop => parseInt(prop, 10)

    const osPart = await OsParts.findByPk(query.osPartId, { transaction })

    await osPart.update(
      {
        return: (convertForInt(osPart.return) + 1).toString(),
        serialNumbers: osPart.serialNumbers.filter(
          item => item !== query.serialNumber
        ),
        outSerialNumbers: osPart.outSerialNumbers
          ? [...osPart.outSerialNumbers, query.serialNumber]
          : [query.serialNumber]
      },
      { transaction }
    )

    if (
      convertForInt(osPart.amount) ===
      convertForInt(osPart.return) +
        convertForInt(osPart.missOut) +
        convertForInt(osPart.output)
    ) {
      await osPart.destroy({ transaction })

      const osParts = await OsParts.findAll({
        where: { oId: osPart.oId },
        transaction
      })

      if (osParts.length === 0) {
        const os = await Os.findByPk(osPart.oId, { transaction })

        await os.destroy({ transaction })
      }
    }

    await technicianReserve.destroy({ transaction })
  }
}
