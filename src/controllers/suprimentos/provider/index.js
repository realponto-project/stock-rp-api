const R = require("ramda");

const SupProviderDomain = require("../../../domains/suprimentos/provider");
const database = require("../../../database");

const supProviderDomain = new SupProviderDomain();

const create = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const provider = await supProviderDomain.create(req.body, { transaction });

    await transaction.commit();
    res.json(provider);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  create
};
