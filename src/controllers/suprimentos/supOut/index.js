const R = require("ramda");

const SupOutDomain = require("../../../domains/suprimentos/out");
const database = require("../../../database");

const supOutDomain = new SupOutDomain();

const create = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const supOut = await supOutDomain.create(req.body, { transaction });

    await transaction.commit();
    res.json(supOut);
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

    const supOut = await supOutDomain.getAll({ query, transaction });

    await transaction.commit();
    res.json(supOut);
  } catch (error) {
    await transaction.rollback();
    next();
  }
};
module.exports = {
  create,
  getAll
};
