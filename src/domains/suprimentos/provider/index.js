const R = require("ramda");
const Cnpj = require("@fnando/cnpj/es");
const Cpf = require("@fnando/cpf/es");

const { FieldValidationError } = require("../../../helpers/errors");
const formatQuery = require("../../../helpers/lazyLoad");
const database = require("../../../database");
const SupContactDomain = require("../contact");

const SupProvider = database.model("supProvider");
const SupContact = database.model("supContact");

const supContactDomain = new SupContactDomain();

module.exports = class SupProviderDomain {
  async create(body, options = {}) {
    const { transaction = null } = options;

    const supProvider = body;

    const notHasProp = prop => R.not(R.has(prop, supProvider));

    let errors = false;

    const field = {
      razaoSocial: false,
      cnpj: false,
      number: false,
      zipCode: false,
      street: false,
      city: false,
      state: false,
      neighborhood: false,
      referencePoint: false,
      complement: false,
      contacts: false
    };

    const message = {
      razaoSocial: "",
      cnpj: "",
      number: "",
      zipCode: "",
      street: "",
      city: "",
      state: "",
      neighborhood: "",
      referencePoint: "",
      complement: "",
      contacts: ""
    };

    if (notHasProp("razaoSocial") || !supProvider.razaoSocial) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "razaoSocial cannot null";
    } else if (
      await supProvider.findOne({
        where: { razaoSocial: supProvider.razaoSocial },
        transaction
      })
    ) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "razaoSocial already registered";
    }

    if (notHasProp("cnpj") || !supProvider.cnpj) {
      errors = true;
      field.cnpj = true;
      message.cnpj = "cnpj cannot null";
    } else {
      const cnpjOrCpf = supProvider.cnpj.replace(/\D/g, "");

      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true;
        field.cnpj = true;
        message.cnpj = "cnpj or cpf invalid";
      } else if (
        await SupProvider.findOne({
          where: {
            cnpj: cnpjOrCpf
          },
          transaction
        })
      ) {
        errors = true;
        field.cnpj = true;
        message.cnpj = "cnpj already registered";
      }
    }

    if (notHasProp("number") || !supProvider.number) {
      errors = true;
      field.number = true;
      message.number = "number cannot null";
    } else if (!/\D/.test(supProvider.number)) {
      errors = true;
      field.number = true;
      message.number = "number invalid";
    }

    if (notHasProp("zipCode") || !supProvider.zipCode) {
      errors = true;
      field.zipCode = true;
      message.zipCode = "zipCode cannot null";
    } else if (!/^\d{8}$/.test(supProvider.zipCode.replace(/\D/gi, ""))) {
      errors = true;
      field.zipCode = true;
      message.zipCode = "zipCode invalid";
    }
    if (notHasProp("street") || !supProvider.street) {
      errors = true;
      field.street = true;
      message.street = "street cannot null";
    }
    if (notHasProp("city") || !supProvider.city) {
      errors = true;
      field.city = true;
      message.city = "city cannot null";
    }
    if (notHasProp("state") || !supProvider.state) {
      errors = true;
      field.state = true;
      message.state = "state cannot null";
    }
    if (notHasProp("neighborhood") || !supProvider.neighborhood) {
      errors = true;
      field.neighborhood = true;
      message.neighborhood = "neighborhood cannot null";
    }

    if (
      notHasProp("contacts") ||
      !supProvider.contacts ||
      supProvider.contacts.length === 0
    ) {
      errors = true;
      field.contacts = true;
      message.contacts = "contacts cannot null";
    }
    if (notHasProp("referencePoint")) {
      errors = true;
      field.referencePoint = true;
      message.referencePoint = "referencePoint cannot undefined";
    }
    if (notHasProp("complement")) {
      errors = true;
      field.complement = true;
      message.complement = "complement cannot undefined";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const supProviderCreated = await SupProvider.create(supProvider, {
      transaction
    });

    const { contacts } = supProvider;

    await Promise.all(
      contacts.map(
        async contact =>
          await supContactDomain.create(
            { ...contact, supProviderId: supProviderCreated.id },
            { transaction }
          )
      )
    );

    return await SupProvider.findByPk(supProviderCreated.id, {
      include: [{ model: SupContact }],
      transaction
    });
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const supProviders = await SupProvider.findAndCountAll({
      where: getWhere("supProvider"),
      include: [{ model: SupContact }],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
      transaction
    });

    const { rows, count } = supProviders;

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
    const supProvider = R.omit(["id"], body);

    const oldSupProvider = await SupProvider.findByPk(body.id, { transaction });

    if (!oldSupProvider) {
      throw new FieldValidationError({
        field: { id: true },
        message: { id: "invalid id" }
      });
    }

    const notHasProp = prop => R.not(R.has(prop, supProvider));

    let errors = false;

    const field = {
      razaoSocial: false,
      cnpj: false,
      number: false,
      zipCode: false,
      street: false,
      city: false,
      state: false,
      neighborhood: false,
      referencePoint: false,
      complement: false
      // contacts: false
    };

    const message = {
      razaoSocial: "",
      cnpj: "",
      number: "",
      zipCode: "",
      street: "",
      city: "",
      state: "",
      neighborhood: "",
      referencePoint: "",
      complement: ""
      // contacts: ""
    };

    if (notHasProp("razaoSocial") || !supProvider.razaoSocial) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "razaoSocial cannot null";
    } else if (
      (await supProvider.findOne({
        where: { razaoSocial: supProvider.razaoSocial },
        transaction
      })) &&
      oldSupProvider.razaoSocial !== supProvider.razaoSocial
    ) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "razaoSocial already registered";
    }

    if (notHasProp("cnpj") || !supProvider.cnpj) {
      errors = true;
      field.cnpj = true;
      message.cnpj = "cnpj cannot null";
    } else {
      const cnpjOrCpf = supProvider.cnpj.replace(/\D/g, "");

      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true;
        field.cnpj = true;
        message.cnpj = "cnpj or cpf invalid";
      } else if (
        (await SupProvider.findOne({
          where: {
            cnpj: cnpjOrCpf
          },
          transaction
        })) &&
        oldSupProvider.cnpj !== cnpjOrCpf
      ) {
        errors = true;
        field.cnpj = true;
        message.cnpj = "cnpj already registered";
      }
    }

    if (notHasProp("number") || !supProvider.number) {
      errors = true;
      field.number = true;
      message.number = "number cannot null";
    } else if (!/\D/.test(supProvider.number)) {
      errors = true;
      field.number = true;
      message.number = "number invalid";
    }

    if (notHasProp("zipCode") || !supProvider.zipCode) {
      errors = true;
      field.zipCode = true;
      message.zipCode = "zipCode cannot null";
    } else if (!/^\d{8}$/.test(supProvider.zipCode.replace(/\D/gi, ""))) {
      errors = true;
      field.zipCode = true;
      message.zipCode = "zipCode invalid";
    }
    if (notHasProp("street") || !supProvider.street) {
      errors = true;
      field.street = true;
      message.street = "street cannot null";
    }
    if (notHasProp("city") || !supProvider.city) {
      errors = true;
      field.city = true;
      message.city = "city cannot null";
    }
    if (notHasProp("state") || !supProvider.state) {
      errors = true;
      field.state = true;
      message.state = "state cannot null";
    }
    if (notHasProp("neighborhood") || !supProvider.neighborhood) {
      errors = true;
      field.neighborhood = true;
      message.neighborhood = "neighborhood cannot null";
    }

    // if (
    //   notHasProp("contacts") ||
    //   !supProvider.contacts ||
    //   supProvider.contacts.length === 0
    // ) {
    //   errors = true;
    //   field.contacts = true;
    //   message.contacts = "contacts cannot null";
    // }

    if (notHasProp("referencePoint")) {
      errors = true;
      field.referencePoint = true;
      message.referencePoint = "referencePoint cannot undefined";
    }
    if (notHasProp("complement")) {
      errors = true;
      field.complement = true;
      message.complement = "complement cannot undefined";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    // const { contacts } = supProvider;

    // await Promise.all(
    //   contacts.map(
    //     async contact =>
    //       await supContactDomain.create(
    //         { ...contact, supProviderId: supProviderCreated.id },
    //         { transaction }
    //       )
    //   )
    // );

    return await oldSupProvider.update(supProvider, {
      // include: [{ model: SupContact }],
      transaction
    });
  }
};
