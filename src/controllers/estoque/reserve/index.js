const R = require("ramda")

const ReservaTecnicoDomain = require("../../../domains/estoque/reserve/ReservaTecnico")
const OsDomain = require("../../../domains/estoque/reserve/os")
const KitDomain = require("../../../domains/estoque/reserve/kit")
const KitOutDomain = require("../../../domains/estoque/reserve/kit/kitOut")
const FreeMarketDomain = require("../../../domains/estoque/reserve/freeMarket")
const StatusExpeditionDomain = require("../../../domains/estoque/reserve/os/statusExpedition")
const ReservaInternoDomain = require("../../../domains/estoque/reserve/interno")
const database = require("../../../database")

const osDomain = new OsDomain()
const kitDomain = new KitDomain()
const kitOutDomain = new KitOutDomain()
const freeMarketDomain = new FreeMarketDomain()
const statusExpeditionDomain = new StatusExpeditionDomain()
const reservaInternoDomain = new ReservaInternoDomain()

const createReservaInterno = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const reservaInterno = await reservaInternoDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(reservaInterno)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const associarEquipParaOsPart = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const reservaTecnico = await ReservaTecnicoDomain.associarEquipParaOsPart(
      req.body,
      { transaction }
    )

    await transaction.commit()
    res.json(reservaTecnico)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
const associarEquipsParaOsPart = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const reservaTecnico = await ReservaTecnicoDomain.associarEquipsParaOsPart(
      req.body,
      { transaction }
    )

    await transaction.commit()
    res.json(reservaTecnico)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const finalizarCheckout = async (req, res, next) => {
  const transaction = await database.transaction()

  try {
    // eslint-disable-next-line no-plusplus
    // for (let index = 0; index < req.body.length; index++) {
    //   // eslint-disable-next-line no-await-in-loop
    //   await osDomain.finalizarCheckout(req.body[index], { transaction })
    // }

    req.body.forEach(async (item) => {
      await osDomain.finalizarCheckout(item, { transaction })
    })

    await transaction.commit()
    res.json({ message: "sucess" })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const createReservaTecnico = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const reservaTecnico = await ReservaTecnicoDomain.create(req.body, { transaction })

    await transaction.commit()
    res.json(reservaTecnico)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllReservaTecnico = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const reservaTecnicos = await ReservaTecnicoDomain.getAll({
      query,
      transaction
    })

    await transaction.commit()
    res.json(reservaTecnicos)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllReservaInterno = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const reservaInternos = await reservaInternoDomain.getAll({
      query,
      transaction
    })

    await transaction.commit()
    res.json(reservaInternos)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllReservaTecnicoForReturn = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const reservaTecnicos = await ReservaTecnicoDomain.getAllForReturn({
      query,
      transaction
    })

    await transaction.commit()
    res.json(reservaTecnicos)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const updateOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const output = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.output(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const returnOutput = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.returnOutput(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const deleteOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.delete(req.query.osId, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const deleteOsPart = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.deleteOsPart(req.query, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const addKit = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const kitOut = await kitDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(kitOut)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllKit = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kits = await kitDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(kits)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getKitDefaultValue = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kitDefault = await kitDomain.getKitDefaultValue({
      query,
      transaction
    })

    await transaction.commit()
    res.json(kitDefault)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addKitOut = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const kitOut = await kitOutDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(kitOut)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllKitOut = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kitsOut = await kitOutDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(kitsOut)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addFreeMarket = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const freeMarket = await freeMarketDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(freeMarket)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllFreeMarket = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const FreeMarket = await freeMarketDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(FreeMarket)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const entrances = await osDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(entrances)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllOsPartsByParams = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const osParts = await osDomain.getAllOsPartsByParams({
      query,
      transaction
    })

    await transaction.commit()
    res.json(osParts)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}
const getAllOsParts = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const osParts = await osDomain.getAllOsParts({
      query,
      transaction
    })

    await transaction.commit()
    res.json(osParts)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}
const getAllOsPartsByParamsForReturn = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const osParts = await osDomain.getAllOsPartsByParamsForReturn({
      query,
      transaction
    })

    await transaction.commit()
    res.json(osParts)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getOsByOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { os } = req.query
    const company = await osDomain.getOsByOs(os)

    await transaction.commit()
    res.json(company)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addStatusExpedition = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const status = await statusExpeditionDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(status)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const updateStatusExpedition = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const status = await statusExpeditionDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(status)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const deleteStatusExpedition = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const status = await statusExpeditionDomain.delete(req.query.id, { transaction })

    await transaction.commit()
    res.json(status)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllStatusExpedition = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const entrances = await statusExpeditionDomain.getAll({
      query,
      transaction
    })

    await transaction.commit()
    res.json(entrances)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  createReservaInterno,
  getAllReservaTecnico,
  getAllReservaTecnicoForReturn,
  getAllReservaInterno,
  createReservaTecnico,
  associarEquipParaOsPart,
  associarEquipsParaOsPart,

  finalizarCheckout,

  addOs,
  output,
  returnOutput,
  updateOs,
  deleteOs,
  deleteOsPart,
  addKit,
  getAllKit,
  getKitDefaultValue,
  addKitOut,
  getAllKitOut,
  addFreeMarket,
  getAllFreeMarket,
  getAllOs,
  getAllOsPartsByParams,
  getAllOsParts,
  getAllOsPartsByParamsForReturn,
  getOsByOs,
  addStatusExpedition,
  updateStatusExpedition,
  deleteStatusExpedition,
  getAllStatusExpedition
  //   getAll,
}
