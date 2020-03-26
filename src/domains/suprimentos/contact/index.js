const R = require("ramda");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const SupProvider = database.model("supProvider");
const SupContact = database.model("supContact");

module.exports = class SupContactDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const SupContact = body;

    const notHasProp = prop => R.not(R.has(prop, SupContact));

    let errors = false;

    const field = {
      name: false,
      telphone: false,
      email: false,
      supProviderId: false
    };

    const message = {
      name: "",
      telphone: "",
      email: "",
      supProviderId: ""
    };

    if (notHasProp("name") || !SupContact.name) {
      errors = true;
      field.name = true;
      message.name = "name cannot null";
    }

    if (notHasProp("telphone") || !SupContact.telphone) {
      errors = true;
      field.telphone = true;
      message.telphone = "telphone cannot null";
    }

    if (notHasProp("email") || !SupContact.email) {
      errors = true;
      field.email = true;
      message.email = "email cannot null";
    } else if (
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(SupContact.email)
    ) {
      errors = true;
      field.email = true;
      message.email = "email invalid";
    }

    if (notHasProp("supProviderId") || !SupContact.supProviderId) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "supProviderId cannot null";
    } else if (
      !(await SupProvider.findByPk(SupContact.supProviderId, { transaction }))
    ) {
      errors = true;
      field.supProviderId = true;
      message.supProviderId = "SupProvider not found";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    return await SupContact.create(supContact, { transaction });
  }
};
