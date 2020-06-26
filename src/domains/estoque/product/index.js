const R = require("ramda");
const moment = require("moment");
const Sequelize = require("sequelize");

const formatQuery = require("../../../helpers/lazyLoad");
const database = require("../../../database");

const { FieldValidationError } = require("../../../helpers/errors");

// // const EquipMark = database.model('equipMark')
const Equip = database.model("equip");
const EquipType = database.model("equipType");
const Mark = database.model("mark");
const Product = database.model("product");
const ProductBase = database.model("productBase");
const StockBase = database.model("stockBase");
const Os = database.model("os");
const OsParts = database.model("osParts");
const FreeMarketParts = database.model("freeMarketParts");
const Entrance = database.model("entrance");
const TechnicianReserve = database.model("technicianReserve");
const TechnicianReserveParts = database.model("technicianReserveParts");
const KitOut = database.model("kitOut");
const KitParts = database.model("kitParts");

const { Op: operators } = Sequelize;

module.exports = class ProductDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const product = R.omit(["id", "type", "mark"], bodyData);

    const productNotHasProp = (prop) => R.not(R.has(prop, product));
    const bodyDataNotHasProp = (prop) => R.not(R.has(prop, bodyData));
    // const productHasProp = prop => R.has(prop, product)

    const field = {
      name: false,
      category: false,
      SKU: false,
      serial: false,
      modulo: false,
      minimumStock: false,
      mark: false,
      type: false,
      corredor: false,
      coluna: false,
      prateleira: false,
      gaveta: false,
    };
    const message = {
      name: "",
      category: "",
      SKU: "",
      serial: "",
      modulo: "",
      minimumStock: "",
      mark: "",
      type: "",
      corredor: "",
      coluna: "",
      prateleira: "",
      gaveta: "",
    };

    let errors = false;

    if (productNotHasProp("name") || !product.name) {
      errors = true;
      field.item = true;
      message.item = "Informe o nome.";
    } else {
      const { name } = product;

      const productHasExist = await Product.findOne({
        where: { name },
        transaction,
      });

      if (productHasExist) {
        errors = true;
        field.item = true;
        message.item = "Nome já cadastrado.";
      }
    }

    if (productNotHasProp("category")) {
      errors = true;
      field.category = true;
      message.category = "categoria não foi passada";
    } else if (
      product.category !== "peca" &&
      product.category !== "equipamento" &&
      product.category !== "acessorios"
    ) {
      errors = true;
      field.category = true;
      message.category = "categoria inválida";

      throw new FieldValidationError([{ field, message }]);
    }

    if (productNotHasProp("SKU") || !product.SKU) {
      errors = true;
      field.codigo = true;
      message.codigo = "Informe o código.";
    } else {
      const { SKU } = product;

      const productHasExist = await Product.findOne({
        where: { SKU },
        transaction,
      });

      if (productHasExist) {
        errors = true;
        field.codigo = true;
        message.codigo = "SKU já cadastrado.";
      }
    }

    if (productNotHasProp("minimumStock") || !product.minimumStock) {
      errors = true;
      field.quantMin = true;
      message.quantMin = "Por favor informe a quantidade";
    } else if (
      product.minimumStock !== product.minimumStock.replace(/\D/gi, "")
    ) {
      errors = true;
      field.quantMin = true;
      message.quantMin = "número invalido.";
    }

    if (bodyDataNotHasProp("mark") || !bodyData.mark) {
      errors = true;
      field.mark = true;
      message.mark = "Por favor digite a marca do produto.";
    } else {
      const markHasExist = await Mark.findOne({
        where: { mark: bodyData.mark },
        transaction,
      });

      if (!markHasExist) {
        errors = true;
        field.mark = true;
        message.mark = "Selecione uma marca";
      } else {
        product.markId = markHasExist.id;
      }
    }

    if (productNotHasProp("modulo") || typeof product.modulo !== "boolean") {
      errors = true;
      field.modulo = true;
      message.modulo = "modulo cannot undefined";
    }

    if (bodyData.category === "equipamento") {
      if (productNotHasProp("serial") || typeof product.serial !== "boolean") {
        errors = true;
        field.quantMin = true;
        message.quantMin = "Informe se tem numero de série";
      }

      if (bodyDataNotHasProp("type") || !bodyData.type) {
        errors = true;
        field.type = true;
        message.type = "Informe o tipo.";
      } else {
        const equipTypeHasExist = await EquipType.findOne({
          where: { type: bodyData.type },
          transaction,
        });

        if (!equipTypeHasExist) {
          errors = true;
          field.type = true;
          message.type = "Selecione uma marca";
        } else {
          product.equipTypeId = equipTypeHasExist.id;
        }
      }
    }

    if (productNotHasProp("corredor")) {
      errors = true;
      field.corredor = true;
      message.corredor = "corredor cannot undefined";
    }

    if (productNotHasProp("coluna")) {
      errors = true;
      field.coluna = true;
      message.coluna = "coluna cannot undefined";
    }
    if (productNotHasProp("prateleira")) {
      errors = true;
      field.prateleira = true;
      message.prateleira = "prateleira cannot undefined";
    }
    if (productNotHasProp("gaveta")) {
      errors = true;
      field.gaveta = true;
      message.gaveta = "gaveta cannot undefined";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const productCreated = await Product.create(product, { transaction });

    const response = await Product.findByPk(productCreated.id, {
      include: [{ model: Mark }, { model: EquipType }],
      transaction,
    });

    return response;
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options;

    const product = R.omit(["id", "type", "mark", "modulo"], bodyData);

    const productNotHasProp = (prop) => R.not(R.has(prop, product));
    const bodyDataNotHasProp = (prop) => R.not(R.has(prop, bodyData));
    // const productHasProp = prop => R.has(prop, product)

    const oldProduct = await Product.findByPk(bodyData.id, { transaction });

    const field = {
      name: false,
      category: false,
      SKU: false,
      serial: false,
      minimumStock: false,
      mark: false,
      type: false,
      corredor: false,
      coluna: false,
      prateleira: false,
      gaveta: false,
    };
    const message = {
      name: "",
      category: "",
      SKU: "",
      serial: "",
      minimumStock: "",
      mark: "",
      type: "",
      corredor: "",
      coluna: "",
      prateleira: "",
      gaveta: "",
    };

    let errors = false;

    if (!oldProduct) {
      errors = true;
      field.type = true;
      message.type = "Informe o tipo.";
    }

    if (productNotHasProp("name") || !product.name) {
      errors = true;
      field.item = true;
      message.item = "Informe o nome.";
    } else {
      const { name } = product;

      const productHasExist = await Product.findOne({
        where: { name },
        transaction,
      });

      if (productHasExist && productHasExist.id !== bodyData.id) {
        errors = true;
        field.item = true;
        message.item = "Nome já cadastrado.";
      }
    }

    if (productNotHasProp("category")) {
      errors = true;
      field.category = true;
      message.category = "categoria não foi passada";
    } else if (
      product.category !== "peca" &&
      product.category !== "equipamento" &&
      product.category !== "acessorios"
    ) {
      errors = true;
      field.category = true;
      message.category = "categoria inválida";

      throw new FieldValidationError([{ field, message }]);
    }

    if (productNotHasProp("SKU") || !product.SKU) {
      errors = true;
      field.codigo = true;
      message.codigo = "Informe o código.";
    } else {
      const { SKU } = product;

      const productHasExist = await Product.findOne({
        where: { SKU },
        transaction,
      });

      if (productHasExist && productHasExist.id !== bodyData.id) {
        errors = true;
        field.name = true;
        message.name = "código já cadastrado.";
      }
    }

    if (productNotHasProp("minimumStock") || !product.minimumStock) {
      errors = true;
      field.quantMin = true;
      message.quantMin = "Por favor informe a quantidade";
    } else if (
      product.minimumStock !== product.minimumStock.replace(/\D/gi, "")
    ) {
      errors = true;
      field.quantMin = true;
      message.quantMin = "número invalido.";
    }

    if (bodyDataNotHasProp("mark") || !bodyData.mark) {
      errors = true;
      field.mark = true;
      message.mark = "Por favor digite a marca do produto.";
    } else {
      const markHasExist = await Mark.findOne({
        where: { mark: bodyData.mark },
        transaction,
      });

      if (!markHasExist) {
        errors = true;
        field.mark = true;
        message.mark = "Selecione uma marca";
      } else {
        product.markId = markHasExist.id;
      }
    }

    if (bodyData.category === "equipamento") {
      if (productNotHasProp("serial") || typeof product.serial !== "boolean") {
        errors = true;
        field.quantMin = true;
        message.quantMin = "Informe se tem numero de série";
      }

      if (bodyDataNotHasProp("type") || !bodyData.type) {
        errors = true;
        field.type = true;
        message.type = "Informe o tipo.";
      } else {
        const equipTypeHasExist = await EquipType.findOne({
          where: { type: bodyData.type },
          transaction,
        });

        if (!equipTypeHasExist) {
          errors = true;
          field.type = true;
          message.type = "Selecione uma marca";
        } else {
          product.equipTypeId = equipTypeHasExist.id;
        }
      }
    }

    if (productNotHasProp("corredor")) {
      errors = true;
      field.corredor = true;
      message.corredor = "corredor cannot undefined";
    }

    if (productNotHasProp("coluna")) {
      errors = true;
      field.coluna = true;
      message.coluna = "coluna cannot undefined";
    }
    if (productNotHasProp("prateleira")) {
      errors = true;
      field.prateleira = true;
      message.prateleira = "prateleira cannot undefined";
    }
    if (productNotHasProp("gaveta")) {
      errors = true;
      field.gaveta = true;
      message.gaveta = "gaveta cannot undefined";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const newProduct = {
      ...oldProduct,
      ...product,
    };

    await oldProduct.update(newProduct, { transaction });

    const response = await Product.findByPk(bodyData.id, {
      include: [{ model: Mark }, { model: EquipType }],
      transaction,
    });

    return response;
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "ASC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    console.log(getWhere("product"));

    const products = await Product.findAndCountAll({
      where: getWhere("product"),
      include: [
        {
          model: Mark,
          where: getWhere("mark"),
          required: true,
        },
        {
          model: EquipType,
          where: getWhere("equipType"),
          required:
            newQuery.filters &&
            newQuery.filters.equipType &&
            newQuery.filters.equipType.specific.type,
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit: newQuery.total,
      offset,
      transaction,
    });

    const { rows } = products;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: products.count,
        rows: [],
      };
    }

    const formatDateFunct = (date) => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      const formatHours = moment(date).format("LT");
      const dateformated = `${formatDate} ${formatHours}`;
      return dateformated;
    };

    const formatData = R.map((product) => {
      const resp = {
        id: product.id,
        amount: product.amount,
        category: product.category,
        description: product.description,
        sku: product.SKU,
        minimumStock: product.minimumStock,
        mark: product.mark.mark,
        name: product.name,
        serial: product.serial,
        corredor: product.corredor,
        coluna: product.coluna,
        prateleira: product.prateleira,
        gaveta: product.gaveta,
        type: product.equipType ? product.equipType.type : "-",
        createdAt: formatDateFunct(product.createdAt),
        updatedAt: formatDateFunct(product.updatedAt),
      };
      return resp;
    });

    const productsList = formatData(rows);

    let show = limit;
    if (products.count < show) {
      show = products.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: products.count,
      rows: productsList,
    };

    return response;
  }

  async getAllNames(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere } = formatQuery(newQuery);

    console.log(getWhere("product"));

    const products = await Product.findAll({
      where: getWhere("product"),
      attributes: ["id", "name", "serial", "modulo"],
      order: [["name", "ASC"]],
      limit: 20,
      transaction,
    });

    console.log(JSON.parse(JSON.stringify(products)));

    const response = products.map((item) => ({
      id: item.id,
      name: item.name,
      serial: item.serial,
    }));

    return response;
  }

  async getEquipsByEntrance(options = {}) {
    const { query = null, transaction = null } = options;

    const equips = await Equip.findAll({
      where: {
        createdAt: {
          [operators.gte]: moment(query.createdAt)
            .subtract(5, "seconds")
            .toString(),
          [operators.lte]: moment(query.createdAt).add(5, "seconds").toString(),
        },
      },
      attributes: ["serialNumber"],
      order: [["serialNumber", "ASC"]],
      transaction,
    });

    return equips;
  }

  async getProductByStockBase(options = {}) {
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);

    const { getWhere } = formatQuery(newQuery);

    const kit =
      R.prop("kit", query) === undefined ? false : R.prop("kit", query);

    let or = {};

    if (kit) {
      or = {
        [operators.or]: [
          {
            category: { [operators.eq]: "peca" },
          },
          {
            category: { [operators.eq]: "acessorios" },
          },
        ],
      };
    }

    const products = await Product.findAll({
      where: { ...or, ...getWhere("product") },
      order: [["name", "ASC"]],
      limit: 20,
      include: [
        {
          model: StockBase,
          where: getWhere("stockBase"),
        },
      ],
      transaction,
    });

    const response = products.map((product) => {
      const resp = {
        id: product.stockBases[0].productBase.id,
        available: product.stockBases[0].productBase.available,
        name: product.name,
        serial: product.serial,
      };
      return resp;
    });
    return response.filter((item) => parseInt(item.available, 10) !== 0);
  }

  async getAllVendas(options = {}) {
    const inicialOrder = {
      field: "name",
      acendent: true,
      direction: "ASC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const products = await Product.findAndCountAll({
      where: getWhere("product"),
      include: [
        {
          model: StockBase,
        },
        {
          attributes: ["amountAdded", "productId"],
          model: Entrance,
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { count, rows } = products;

    const formatData = R.map(async (product) => {
      let quantidadeSaidaTotal = 0;
      let saidaEComerce = 0;
      let saidaOs = 0;
      let saidaInterno = 0;
      let saidaKit = 0;

      // product.entrances.map(
      //   (entrance) =>
      //     (quantidadeSaidaTotal =
      //       quantidadeSaidaTotal + parseInt(entrance.amountAdded, 10))
      // );

      // product.stockBases.map((stockBase) => {
      //   quantidadeSaidaTotal =
      //     quantidadeSaidaTotal - parseInt(stockBase.productBase.amount, 10);
      // });

      const freeMarketParts = await FreeMarketParts.findAll({
        attributes: ["productBaseId", "amount", "createdAt"],
        where: getWhere("freeMarketParts"),
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: ProductBase,
            where: { productId: product.id },
            attributes: ["id"],
          },
        ],
        paranoid: false,
        transaction,
      });

      const osParts = await OsParts.findAll({
        attributes: ["productBaseId", "output", "deletedAt"],
        order: [["deletedAt", "DESC"]],
        where: getWhere("osParts"),
        include: [
          {
            model: ProductBase,
            where: { productId: product.id },
            attributes: ["id"],
          },
        ],
        paranoid: false,
        transaction,
      });

      const technicianReserveParts = await TechnicianReserveParts.findAll({
        attributes: ["productBaseId", "amount", "createdAt"],
        order: [["createdAt", "DESC"]],
        where: getWhere("technicianReserveParts"),
        include: [
          {
            model: ProductBase,
            where: { productId: product.id },
            attributes: ["id"],
          },
        ],
        paranoid: false,
        transaction,
      });

      const kitOuts = await KitOut.findAll({
        attributes: ["kitPartId", "amount", "updatedAt"],
        order: [["updatedAt", "DESC"]],
        where: getWhere("kitOut"),
        include: [
          {
            attributes: ["productBaseId"],
            model: KitParts,
            required: true,
            include: [
              {
                model: ProductBase,
                where: { productId: product.id },
                attributes: ["id"],
              },
            ],
          },
        ],
        transaction,
      });

      freeMarketParts.map(
        (freeMarketPart) =>
          (saidaEComerce = saidaEComerce + parseInt(freeMarketPart.amount, 10))
      );
      osParts.map(
        (osPart) => (saidaOs = saidaOs + parseInt(osPart.output, 10))
      );
      technicianReserveParts.map(
        (technicianReservePart) =>
          (saidaInterno =
            saidaInterno + parseInt(technicianReservePart.amount, 10))
      );

      kitOuts.map(
        (kitOut) => (saidaKit = saidaKit + parseInt(kitOut.amount, 10))
      );

      const resp = {
        id: product.id,
        name: product.name,
        quantidadeSaidaTotal: saidaOs + saidaEComerce + saidaInterno + saidaKit,
        saidaOs,
        createdAtOs: osParts.length > 0 ? osParts[0].deletedAt : null,
        saidaEComerce,
        createdAtEComerce:
          freeMarketParts.length > 0 ? freeMarketParts[0].createdAt : null,
        saidaInterno,
        createdAtInterno:
          technicianReserveParts.length > 0
            ? technicianReserveParts[0].createdAt
            : null,
        saidaKit,
        createdAtKit: kitOuts.length > 0 ? kitOuts[0].updatedAt : null,
      };
      return {
        ...resp,
        updatedAt: Math.max(
          resp.createdAtOs,
          resp.createdAtEComerce,
          resp.createdAtInterno,
          resp.createdAtKit
        ),
      };
    });

    const productsList = await Promise.all(formatData(rows));

    return {
      page: pageResponse,
      show: R.min(count, limit),
      count,
      rows: productsList,
    };
  }
};
