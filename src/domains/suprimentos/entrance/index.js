const R = require("ramda");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const SubEntrance = database.model("subEntrance");
const SupProduct = database.model("supProduct");
const SupProvider = database.model("supProvider");

module.exports = class SubEntranceDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const subEntrance = R.omit(["total"], body);

    const notHasProp = prop => R.not(R.has(prop, subEntrance));

    let errors = false;

    const field = {
      amount: false,
      priceUnit: false,
      discount: false,
      supProviderId: false,
      supProductId: false
    };

    const message = {
      amount: "",
      priceUnit: "",
      discount: "",
      supProviderId: "",
      supProductId: ""
    };

    if (notHasProp("amount")) {
      errors = true;
      field.amount = true;
      message.amount = "amount cannot undefined";
    } else if (typeof subEntrance.amount !== "number") {
      errors = true;
      field.amount = true;
      message.amount = "amount already registered";
    }

    if (notHasProp("priceUnit")) {
      errors = true;
      field.priceUnit = true;
      message.priceUnit = "priceUnit cannot undefined";
    } else if (typeof subEntrance.priceUnit !== "number") {
      errors = true;
      field.priceUnit = true;
      message.priceUnit = "priceUnit already registered";
    }

    if (notHasProp("discount")) {
      errors = true;
      field.discount = true;
      message.discount = "discount cannot undefined";
    } else if (typeof subEntrance.discount !== "number") {
      errors = true;
      field.discount = true;
      message.discount = "discount already registered";
    }

    if (notHasProp("supProviderId") || !subEntrance.supProviderId) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "supProviderId cannot null";
    } else if (
      !(await SupProvider.findByPk(subEntrance.supProviderId, { transaction }))
    ) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "SupProvider not found";
    }

    let supProduct = null;

    if (notHasProp("supProductId") || !subEntrance.supProductId) {
      errors = true;
      field.supProductId = true;
      message.supProductId = "supProductId cannot null";
    } else {
      csupProduct = await SupProduct.findByPk(subEntrance.supProductId, {
        transaction
      });
      if (!supProduct) {
        errors = true;
        field.supProductId = true;
        message.supProductId = "SupProvider not found";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }
    const { amount, priceUnit, discount } = subEntrance;

    const total = amount * priceUnit - discount;

    await supProduct.update({ amount }, { transaction });

    return await SubEntrance.create({ ...subEntrance, total }, { transaction });
  }
};
