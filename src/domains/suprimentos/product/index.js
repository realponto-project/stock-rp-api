const R = require("ramda");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const formatQuery = require("../../../helpers/lazyLoad");
const SupProduct = database.model("supProduct");
const Manufacturer = database.model("manufacturer");

module.exports = class SubProductDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const supProduct = R.omit(["amount"], body);

    const notHasProp = prop => R.not(R.has(prop, supProduct));

    let errors = false;

    const field = {
      name: false,
      unit: false,
      manufacturerId: false
    };

    const message = {
      name: false,
      unit: false,
      manufacturerId: false
    };

    if (notHasProp("name") || !supProduct.name) {
      errors = true;
      field.name = true;
      message.name = "name cannot null";
    } else if (
      await SupProduct.findOne({
        where: { name: supProduct.name },
        transaction
      })
    ) {
      errors = true;
      field.name = true;
      message.name = "name already registered";
    }

    const unitArray = ["UNID", "PÇ", "CX", "LT"];

    if (notHasProp("unit") || !supProduct.unit) {
      errors = true;
      field.unit = true;
      message.unit = "unit cannot null";
    } else if (
      unitArray.filter(item => item === supProduct.unit).length === 0
    ) {
      errors = true;
      field.unit = true;
      message.unit = "invalid value";
    }

    if (notHasProp("manufacturerId") || !supProduct.manufacturerId) {
      errors = true;
      field.manufacturerId = true;
      message.manufacturerId = "manufacturerId cannot null";
    } else if (
      !(await Manufacturer.findByPk(supProduct.manufacturerId, { transaction }))
    ) {
      errors = true;
      field.manufacturerId = true;
      message.manufacturerId = "manufacturer not found";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    return await SubProduct.create(supProduct, { transaction });
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const supProducts = await SupProduct.findAndCountAll({
      where: getWhere("supProduct"),
      include: [{ model: Manufacturer }],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
      transaction
    });

    const { rows, count } = supProducts;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count,
        rows: []
      };
    }

    return {
      page: pageResponse,
      show: R.min(count, limit),
      count,
      rows
    };
  }

  async update(body, options = {}) {
    const { transaction = null } = options;
    const supProduct = R.omit(["id", "amount"], body);

    const oldSupProduct = await SupProduct.findByPk(body.id, { transaction });

    if (!oldSupProduct) {
      throw new FieldValidationError({
        field: { id: true },
        message: { id: "invalid id" }
      });
    }

    const notHasProp = prop => R.not(R.has(prop, supProduct));

    let errors = false;

    const field = {
      name: false,
      unit: false,
      manufacturerId: false
    };

    const message = {
      name: false,
      unit: false,
      manufacturerId: false
    };

    if (notHasProp("name") || !supProduct.name) {
      errors = true;
      field.name = true;
      message.name = "name cannot null";
    } else if (
      (await SupProduct.findOne({
        where: { name: supProduct.name },
        transaction
      })) &&
      oldSupProduct.name !== supProduct.name
    ) {
      errors = true;
      field.name = true;
      message.name = "name already registered";
    }

    const unitArray = ["UNID", "PÇ", "CX", "LT"];

    if (notHasProp("unit") || !supProduct.unit) {
      errors = true;
      field.unit = true;
      message.unit = "unit cannot null";
    } else if (
      unitArray.filter(item => item === supProduct.unit).length === 0
    ) {
      errors = true;
      field.unit = true;
      message.unit = "invalid value";
    }

    if (notHasProp("manufacturerId") || !supProduct.manufacturerId) {
      errors = true;
      field.manufacturerId = true;
      message.manufacturerId = "manufacturerId cannot null";
    } else if (
      !(await Manufacturer.findByPk(supProduct.manufacturerId, { transaction }))
    ) {
      errors = true;
      field.manufacturerId = true;
      message.manufacturerId = "manufacturer not found";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }
    return await oldSupProduct.update(supProduct, { transaction });
  }
};
