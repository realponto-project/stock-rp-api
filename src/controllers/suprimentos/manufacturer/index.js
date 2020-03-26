const R = require("ramda");

const ManufacturerDomain = require("../../../domains/suprimentos/manufacturer");
const database = require("../../../database");

const manufacturerDomain = new ManufacturerDomain();

const create = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const manufacturer = await manufacturerDomain.create(req.body, {
      transaction
    });

    await transaction.commit();
    res.json(manufacturer);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  create
};
