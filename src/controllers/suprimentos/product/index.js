const R = require("ramda");

const SupProductDomain = require("../../../domains/suprimentos/product");
const database = require("../../../database");

const supProductDomain = new SupProductDomain();

const create = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const product = await supProductDomain.create(req.body, { transaction });

    await transaction.commit();
    res.json(product);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getAll = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    let query;
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query);
      }
    }

    const products = await supProductDomain.getAll({ query, transaction });

    await transaction.commit();
    res.json(products);
  } catch (error) {
    await transaction.rollback();
    next();
  }
};

const update = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const product = await supProductDomain.update(req.body, {
      transaction
    });

    await transaction.commit();
    res.json(product);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  update
};
