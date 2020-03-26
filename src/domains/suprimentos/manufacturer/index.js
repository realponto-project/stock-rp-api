const R = require("ramda");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const Manufacturer = database.model("manufacturer");

module.exports = class ManufacturerDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const manufacturer = body;

    const notHasProp = prop => R.not(R.has(prop, supProduct));

    let errors = false;

    const field = {
      id: false
    };

    const message = {
      id: ""
    };

    if (notHasProp("id") || !manufacturer.id) {
      errors = true;
      field.id = true;
      message.id = "id cannot null";
    } else if (
      await Manufacturer.findOne({
        where: { id: manufacturer.id },
        transaction
      })
    ) {
      errors = true;
      field.id = true;
      message.id = "id already registered";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    return await Manufacturer.create(manufacturer, { transaction });
  }
};
