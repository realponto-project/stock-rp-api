const R = require("ramda");

const TypeAccountDomain = require("../../domains/Auth/user/typeAccount");
const database = require("../../database");

const typeAccountDomain = new TypeAccountDomain();

const add = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const typeAccount = await typeAccountDomain.add(req.body, { transaction });

    await transaction.commit();
    res.json(typeAccount);
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

    const typeAccounts = await typeAccountDomain.getAll({ query, transaction });

    await transaction.commit();
    res.json(typeAccounts);
  } catch (error) {
    await transaction.rollback();
    next();
  }
};

const getResourcesByTypeAccount = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    let query;
    if (R.has("query", req)) {
      if (R.has("query", req.query)) {
        query = JSON.parse(req.query.query);
      }
    }

    const typeAccount = await typeAccountDomain.getResourcesByTypeAccount({
      query,
      transaction
    })

    await transaction.commit();
    res.json(typeAccount);
  } catch (error) {
    await transaction.rollback();
    next();
  }
};

const getByIdTypeAccount = async (req, res, next) => {
  try {
    const typeAccount = await typeAccountDomain.getByIdTypeAccount(req.params.id);
    res.json(typeAccount);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  add,
  getAll,
  getResourcesByTypeAccount,
  getByIdTypeAccount
}
