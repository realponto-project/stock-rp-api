/* eslint-disable array-callback-return */
const R = require('ramda')

const formatQuery = require('../../../../helpers/lazyLoad')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Product = database.model('product')
const ProductBase = database.model('productBase')
const Equip = database.model('equip')
const OsParts = database.model('osParts')
const Os = database.model('os')
const FreeMarketParts = database.model('freeMarketParts')
const FreeMarket = database.model('freeMarket')
const StockBase = database.model('stockBase')
const Mark = database.model('mark')

module.exports = class EquipDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const equip = R.omit(
      ['id', 'productId', 'stockBase', 'serialNumbers'],
      bodyData
    )

    const NotHasProp = (prop, obj) => R.not(R.has(prop, obj))

    const field = {
      productId: false,
      stockBase: false,
      serialNumbers: false
    }
    const message = {
      productId: '',
      stockBase: '',
      serialNumbers: ''
    }

    let errors = false

    if (NotHasProp('productId', bodyData) || !bodyData.productId) {
      errors = true
      field.productId = true
      message.productId = 'Por favor informe productId.'
    } else {
      const productBase = await Product.findByPk(bodyData.productId, {
        transaction
      })

      if (!productBase) {
        errors = true
        field.productId = true
        message.productId = 'productId inválid.'
      }
    }

    if (NotHasProp('stockBase', bodyData) || !bodyData.stockBase) {
      errors = true
      field.stockBase = true
      message.stockBase = 'Por favor informe stockBase.'
    } else {
      const stockBase = await StockBase.findOne({
        where: { stockBase: bodyData.stockBase },
        transaction
      })

      if (stockBase) {
        errors = true
        field.stockBase = true
        message.stockBase = 'stockBase inválid.'
      }
    }

    if (NotHasProp('serialNumber', bodyData) || !bodyData.serialNumber) {
      errors = true
      field.serialNumber = true
      message.serialNumber = 'Por favor informe os números de série.'
    } else {
      const serialNumberReturned = await Equip.findOne({
        where: { serialNumber: equip.serialNumber },
        transaction
      })

      if (serialNumberReturned) {
        errors = true
        field.serialNumber = true
        message.serialNumber = 'Esse equipamento já está cadastrado.'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const { productId, stockBase } = bodyData

    const productBase = await ProductBase.findOne({
      where: { productId },
      include: [
        {
          model: StockBase,
          where: { stockBase }
        }
      ],
      transaction
    })

    equip.productBaseId = productBase.id

    const equipCreated = await Equip.create(equip, { transaction })

    return equipCreated
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

    const { getWhere, pageResponse, offset, limit } = formatQuery(newQuery)

    const equips = await Equip.findAndCountAll({
      where: getWhere('equip'),
      include: [
        {
          required: true,
          model: ProductBase,
          include: [
            { model: StockBase, where: getWhere('stockBase'), required: true },
            {
              model: Product,
              where: getWhere('product'),
              required: true,
              include: [
                {
                  model: Mark,
                  where: getWhere('mark')
                }
              ]
            }
          ]
        }
      ],
      offset,
      limit: newQuery.total === null ? undefined : limit,
      order: [[newOrder.field, newOrder.direction]],
      transaction
    })

    const { rows } = equips

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: equips.count,
        rows: []
      }
    }

    const formatData = R.map(equip => {
      const resp = {
        id: equip.id,
        reserved: equip.reserved,
        inClient: equip.inClient,
        serialNumber: equip.serialNumber,
        razaoSocial: equip.razaoSocial,
        name: equip.productBase && equip.productBase.product.name,
        mark:
          equip.productBase &&
          equip.productBase.product.mark &&
          equip.productBase.product.mark.mark
      }

      return resp
    })

    const equipsList = formatData(rows)

    const response = {
      page: pageResponse,
      show: equipsList.length,
      count: equips.count,
      rows: equipsList
    }

    return response
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const equip = R.omit(['id'], bodyData)

    const oldEquip = await Equip.findByPk(bodyData.id)

    const newEquip = JSON.parse(JSON.stringify(oldEquip))

    Object.assign(newEquip, R.omit(['mark', 'type', 'model'], equip))

    const newEquipNotHasProp = prop => R.not(R.has(prop, newEquip))

    const field = {
      companyId: false,
      serialNumber: false,
      corLeitor: false,
      tipoCracha: false,
      details: false,
      responsibleUser: false,
      proximidade: false,
      bio: false,
      barras: false,
      cartografico: false
    }
    const message = {
      companyId: '',
      serialNumber: '',
      corLeitor: '',
      tipoCracha: '',
      details: '',
      responsibleUser: '',
      proximidade: '',
      bio: '',
      barras: '',
      cartografico: ''
    }

    let errors = false

    if (newEquipNotHasProp('serialNumber') || !newEquip.serialNumber) {
      errors = true
      field.serialNumber = true
      message.serialNumber = 'informe o número de série.'
    } else {
      const serialNumberReturned = await Equip.findOne({
        where: { serialNumber: newEquip.serialNumber },
        transaction
      })

      if (
        serialNumberReturned &&
        newEquip.serialNumber !== oldEquip.serialNumber
      ) {
        errors = true
        field.serialNumber = true
        message.serialNumber = 'já está cadastrado.'
      }
    }

    if (
      newEquipNotHasProp('proximidade') ||
      typeof newEquip.proximidade !== 'boolean'
    ) {
      errors = true
      field.proximidade = true
      message.proximidade = 'proximidade não é um booleano'
    }
    if (newEquipNotHasProp('bio') || typeof newEquip.bio !== 'boolean') {
      errors = true
      field.bio = true
      message.bio = 'bio não é um booleano'
    }
    if (newEquipNotHasProp('barras') || typeof newEquip.barras !== 'boolean') {
      errors = true
      field.barras = true
      message.barras = 'barras não é um booleano'
    }
    if (
      newEquipNotHasProp('cartografico') ||
      typeof newEquip.cartografico !== 'boolean'
    ) {
      errors = true
      field.cartografico = true
      message.cartografico = 'cartografico não é um booleano'
    }

    if (
      newEquipNotHasProp('corLeitor') ||
      (newEquip.corLeitor !== 'Branco' &&
        newEquip.corLeitor !== 'Vermelho' &&
        newEquip.corLeitor !== 'Azul' &&
        newEquip.corLeitor !== 'Verde' &&
        newEquip.corLeitor !== 'NaoSeAplica')
    ) {
      errors = true
      field.corLeitor = true
      message.corLeitor = 'leitor inválido.'
    }

    if (
      newEquipNotHasProp('tipoCracha') ||
      (newEquip.tipoCracha !== 'Hid' &&
        newEquip.tipoCracha !== 'Mifare' &&
        newEquip.tipoCracha !== 'Wiegand' &&
        newEquip.tipoCracha !== 'Abatrack' &&
        newEquip.tipoCracha !== 'Sarial' &&
        newEquip.tipoCracha !== 'NaoSeAplica')
    ) {
      errors = true
      field.tipoCracha = true
      message.tipoCracha = 'leitor inválido.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await oldEquip.update(newEquip, { transaction })

    return response
  }

  async getOneBySerialNumber(serialNumber, options = {}) {
    const { transaction = null, paranoid = false } = options
    const response = await Equip.findOne({
      where: { serialNumber },
      attributes: [
        'id',
        'reserved',
        'deletedAt',
        'osPartId',
        'freeMarketPartId',
        'productBaseId',
        'serialNumber'
      ],
      include: [
        {
          model: OsParts,
          paranoid: false,
          attributes: ['oId'],
          include: [
            {
              paranoid: false,
              attributes: ['os'],
              model: Os
            }
          ]
        },
        {
          model: ProductBase,
          attributes: ['productId'],
          include: [
            {
              model: Product,
              attributes: ['name', 'category', 'serial']
            }
          ]
        },
        {
          paranoid: false,
          model: FreeMarketParts,
          attributes: ['freeMarketId'],
          include: [
            {
              paranoid: false,
              attributes: ['trackingCode'],
              model: FreeMarket
            }
          ]
        }
      ],
      paranoid: paranoid === 'true',
      transaction
    })

    return response
  }

  async delete(body, options = {}) {
    const { transaction = null } = options
    const equip = await Equip.findByPk(body.id, { transaction })
    const productBase = await ProductBase.findByPk(body.productBaseId, {
      transaction
    })

    if (!productBase) {
      throw new FieldValidationError([
        {
          field: { productBaseId: true },
          message: { productBaseId: 'invalid productBaseId' }
        }
      ])
    }

    if (!equip) {
      throw new FieldValidationError([
        { field: { id: true }, message: { id: 'invalid id' } }
      ])
    } else if (equip.reserved || equip.inClient) {
      throw new FieldValidationError([
        {
          field: { id: true },
          message: { id: 'equipamneto reservado ou em cliente' }
        }
      ])
    }

    await equip.destroy({ transaction })

    const amount = parseInt(productBase.amount, 10) - 1
    const available = parseInt(productBase.available, 10) - 1

    await productBase.update({ amount, available }, { transaction })
  }
}
