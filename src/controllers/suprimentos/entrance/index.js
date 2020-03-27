const R = require("ramda");

const SupEntranceDomain = require("../../../domains/suprimentos/entrance");
const database = require("../../../database");

const supEntranceDomain = new SupEntranceDomain();

const create = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const entrance = await supEntranceDomain.create(req.body, { transaction });

    await transaction.commit();
    res.json(entrance);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  create
};
