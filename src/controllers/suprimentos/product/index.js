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

module.exports = {
  create
};
