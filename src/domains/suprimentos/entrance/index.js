const R = require("ramda");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const SupEntrance = database.model("supEntrance");
const SupProduct = database.model("supProduct");
const SupProvider = database.model("supProvider");

module.exports = class SupEntranceDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const supEntrance = R.omit(["total"], body);

    const notHasProp = prop => R.not(R.has(prop, supEntrance));

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
    } else if (typeof supEntrance.amount !== "number") {
      errors = true;
      field.amount = true;
      message.amount = "amount invalid";
    }

    if (notHasProp("priceUnit")) {
      errors = true;
      field.priceUnit = true;
      message.priceUnit = "priceUnit cannot undefined";
    } else if (typeof supEntrance.priceUnit !== "number") {
      errors = true;
      field.priceUnit = true;
      message.priceUnit = "priceUnit invalid";
    }

    if (notHasProp("discount")) {
      errors = true;
      field.discount = true;
      message.discount = "discount cannot undefined";
    } else if (typeof supEntrance.discount !== "number") {
      errors = true;
      field.discount = true;
      message.discount = "discount invalid";
    }

    if (notHasProp("supProviderId") || !supEntrance.supProviderId) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "supProviderId cannot null";
    } else if (
      !(await SupProvider.findByPk(supEntrance.supProviderId, { transaction }))
    ) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "SupProvider not found";
    }

    let supProduct = null;

    if (notHasProp("supProductId") || !supEntrance.supProductId) {
      errors = true;
      field.supProductId = true;
      message.supProductId = "supProductId cannot null";
    } else {
      supProduct = await SupProduct.findByPk(supEntrance.supProductId, {
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
    const { amount, priceUnit, discount } = supEntrance;

    const total = amount * priceUnit - discount;

    await supProduct.update({ amount }, { transaction });

    return await SupEntrance.create({ ...supEntrance, total }, { transaction });
  }
};
