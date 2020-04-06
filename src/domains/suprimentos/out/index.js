const R = require("ramda");
const sgMail = require("@sendgrid/mail");
const { FieldValidationError } = require("../../../helpers/errors");
const database = require("../../../database");
const formatQuery = require("../../../helpers/lazyLoad");
const SupProduct = database.model("supProduct");
const SupOut = database.model("supOut");
const User = database.model("user");

module.exports = class SupOutDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const supOut = R.omit(["id", "authorized"], body);

    const notHasProp = prop => R.not(R.has(prop, supOut));

    let errors = false;

    const field = {
      amount: false,
      solicitante: false,
      emailResp: false,
      emailSolic: false,
      supProductId: false,
      responsibleUser: false
    };

    const message = {
      amount: "",
      solicitante: "",
      emailResp: "",
      emailSolic: "",
      supProductId: "",
      responsibleUser: ""
    };

    if (notHasProp("amount")) {
      errors = true;
      field.amount = true;
      message.amount = "amount cannot undefined";
    } else if (typeof supOut.amount !== "number") {
      errors = true;
      field.amount = true;
      message.amount = "amount already registered";
    }

    if (notHasProp("solicitante") || !supOut.solicitante) {
      errors = true;
      field.solicitante = true;
      message.solicitante = "solicitante cannot null";
    }

    if (notHasProp("emailResp")) {
      errors = true;
      field.emailResp = true;
      message.emailResp = "emailResp cannot undefined";
    } else if (
      supOut.emailResp !== "" &&
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supOut.emailResp)
    ) {
      errors = true;
      field.emailResp = true;
      message.emailResp = "emailResp invalid";
    }

    if (notHasProp("emailSolic") || !supOut.emailSolic) {
      errors = true;
      field.emailSolic = true;
      message.emailSolic = "emailSolic cannot null";
    } else if (
      !/^[\w_\-\.]+@[\w_\-\.]{2,}\.[\w]{2,}(\.[\w])?/.test(supOut.emailSolic)
    ) {
      errors = true;
      field.emailSolic = true;
      message.emailSolic = "emailSolic invalid";
    }

    let supProduct = null;

    if (notHasProp("supProductId") || !supOut.supProductId) {
      errors = true;
      field.supProductId = true;
      message.supProductId = "supProductId cannot null";
    } else {
      supProduct = await SupProduct.findByPk(supOut.supProductId, {
        transaction
      });
      if (!supProduct || supProduct.amount - supOut.amount < 0) {
        errors = true;
        field.supProductId = true;
        message.supProductId = "SupProduct not found";
      }
    }

    if (notHasProp("responsibleUser") || !supOut.responsibleUser) {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "responsibleUser cannot null.";
    } else if (
      !(await User.findOne({
        where: { username: supOut.responsibleUser },
        transaction
      }))
    ) {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "responsibleUser invalid.";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    if (supOut.emailResp !== "") supOut.emailResp = null;

    await supProduct.update(
      { amount: supProduct.amount - supOut.amount },
      { transaction }
    );

    await sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: supOut.emailSolic,
      from: "sistema_estoque@realponto.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: `
      <strong>Quantidade: ${supOut.amount}</strong>
      `
    };
    await sgMail
      .send(msg)
      .then(function(resp) {
        console.log("resposta :");
      })
      .catch(function(err) {
        console.log("error: ", err);
      });

    // if (supOut.emailResp) {
    //   msg.to = supOut.emailResp;

    //   await sgMail
    //     .send(msg)
    //     .then(function(resp) {
    //       console.log("resposta :");
    //     })
    //     .catch(function(err) {
    //       console.log("error: ", err);
    //     });
    // }

    return await SupOut.create(supOut, { transaction });
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    console.log(getWhere("supOut"));
    console.log(getWhere("supProduct"));

    const supOuts = await SupOut.findAndCountAll({
      where: getWhere("supOut"),
      include: [{ model: SupProduct, where: getWhere("supProduct") }],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
      transaction
    });

    const { rows, count } = supOuts;

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

  // async update(body, options = {}) {
  //   const { transaction = null } = options;
  //   const supProduct = R.omit(["id", "amount"], body);

  //   const oldSupProduct = await SupProduct.findByPk(body.id, { transaction });

  //   if (!oldSupProduct) {
  //     throw new FieldValidationError({
  //       field: { id: true },
  //       message: { id: "invalid id" }
  //     });
  //   }

  //   const notHasProp = prop => R.not(R.has(prop, supProduct));

  //   let errors = false;

  //   const field = {
  //     name: false,
  //     unit: false,
  //     manufacturerId: false
  //   };

  //   const message = {
  //     name: false,
  //     unit: false,
  //     manufacturerId: false
  //   };

  //   if (notHasProp("name") || !supProduct.name) {
  //     errors = true;
  //     field.name = true;
  //     message.name = "name cannot null";
  //   } else if (
  //     (await SupProduct.findOne({
  //       where: { name: supProduct.name },
  //       transaction
  //     })) &&
  //     oldSupProduct.name !== supProduct.name
  //   ) {
  //     errors = true;
  //     field.name = true;
  //     message.name = "name already registered";
  //   }

  //   const unitArray = ["UNID", "PÇ", "CX", "LT"];

  //   if (notHasProp("unit") || !supProduct.unit) {
  //     errors = true;
  //     field.unit = true;
  //     message.unit = "unit cannot null";
  //   } else if (
  //     unitArray.filter(item => item === supProduct.unit).length === 0
  //   ) {
  //     errors = true;
  //     field.unit = true;
  //     message.unit = "invalid value";
  //   }

  //   if (notHasProp("manufacturerId") || !supProduct.manufacturerId) {
  //     errors = true;
  //     field.manufacturerId = true;
  //     message.manufacturerId = "manufacturerId cannot null";
  //   } else if (
  //     !(await Manufacturer.findByPk(supProduct.manufacturerId, { transaction }))
  //   ) {
  //     errors = true;
  //     field.manufacturerId = true;
  //     message.manufacturerId = "manufacturer not found";
  //   }

  //   if (errors) {
  //     throw new FieldValidationError([{ field, message }]);
  //   }
  //   return await oldSupProduct.update(supProduct, { transaction });
  // }
};