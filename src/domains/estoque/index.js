const R = require("ramda");
// const moment = require('moment')

const formatQuery = require("../../helpers/lazyLoad");
const database = require("../../database");

const { FieldValidationError } = require("../../helpers/errors");

// const Mark = database.model('mark')
// const Company = database.model('company')
// const Entrance = database.model('entrance')
const Product = database.model("product");
// const User = database.model('user')
const Mark = database.model("mark");
const StockBase = database.model("stockBase");
const ProductBase = database.model("productBase");
const Notification = database.model("notification");
const Equip = database.model("equip");
const EquipType = database.model("equipType");

module.exports = class StockDomain {
  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "ASC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const productBases = await ProductBase.findAndCountAll({
      // where: getWhere('productBase'),
      attributes: ["id", "amount", "available", "analysis", "preAnalysis"],
      include: [
        {
          model: Product,
          attributes: ["name", "category", "minimumStock", "serial", "id"],
          where: getWhere("product"),
          // order: [
          //   ['name', 'ASC'],
          // ],
          include: [
            {
              model: Mark,
              where: getWhere("mark"),
              attributes: ["mark"],
              required: true,
            },
            {
              model: EquipType,
              where: getWhere("equipType"),
            },
          ],
          required: true,
        },
        {
          model: StockBase,
          attributes: ["stockBase"],
          where: getWhere("stockBase"),
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows } = productBases;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: productBases.count,
        rows: [],
      };
    }

    // const formatDateFunct = (date) => {
    //   moment.locale('pt-br')
    //   const formatDate = moment(date).format('L')
    //   const formatHours = moment(date).format('LT')
    //   const dateformated = `${formatDate} ${formatHours}`
    //   return dateformated
    // }

    const formatData = R.map((productBase) => {
      const resp = {
        id: productBase.id,
        amount: productBase.amount,
        analysis: productBase.analysis,
        preAnalysis: productBase.preAnalysis,
        available: productBase.available,
        serial: productBase.product.serial,
        productId: productBase.product.id,
        name: productBase.product.name,
        category: productBase.product.category,
        minimumStock: productBase.product.minimumStock,
        manufacturer: productBase.product.mark.mark,
        stockBase: productBase.stockBase.stockBase,
      };
      return resp;
    });

    const productBasesList = formatData(rows);

    let show = limit;
    if (productBases.count < show) {
      show = productBases.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: productBases.count,
      rows: productBasesList,
    };

    return response;
  }

  async getAllNotification(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "DESC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const { limit, offset, pageResponse } = formatQuery(newQuery);

    const notifications = await Notification.findAndCountAll({
      // attributes: ['id', 'amount', 'available'],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows } = notifications;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: notifications.count,
        rows: [],
      };
    }

    const formatData = R.map((entrance) => {
      const resp = {
        id: entrance.id,
        message: entrance.message,
      };
      return resp;
    });

    const notificationsList = formatData(rows);

    let show = limit;
    if (notifications.count < show) {
      show = notifications.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: notifications.count,
      rows: notificationsList,
    };

    return response;
  }

  async updatteProductBase(body, options = {}) {
    const { transaction = null } = options;

    const bodyNotHasProp = (prop) => R.not(R.has(prop, body));

    let errors = false;

    const field = {
      id: false,
      amount: false,
      serialNumbers: false,
      status: false,
    };

    const message = {
      id: "",
      amount: "",
      serialNumbers: "",
      status: "",
    };

    let productBase = null;

    const statusArray = ["preAnalysis", "analysis"];

    if (bodyNotHasProp("status") || !body.status) {
      errors = true;
      field.status = true;
      message.status = "status cannot null";
    } else if (!statusArray.filter((status) => status === body.status)) {
      errors = true;
      field.status = true;
      message.status = "status invalid";
    }

    if (bodyNotHasProp("id") || !body.id) {
      errors = true;
      field.id = true;
      message.id = "";
    } else {
      productBase = await ProductBase.findByPk(body.id, { transaction });
    }

    if (
      bodyNotHasProp("amount") ||
      !body.amount ||
      typeof body.amount !== "number"
    ) {
      errors = true;
      field.amount = true;
      message.amount = "";
    }

    if (bodyNotHasProp("serialNumbers")) {
      errors = true;
      field.serialNumbers = true;
      message.serialNumbers = "";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    let analysis = null,
      preAnalysis = null,
      amount = null,
      available = null;

    switch (body.status) {
      case "analysis":
        if (body.serialNumbers.length === 0) {
          errors = true;
          field.serialNumbers = true;
          message.serialNumbers = "serialNumbers não pode ser vazio";
        } else {
          const { serialNumbers } = body;

          const serialNumbersFindPromises = serialNumbers.map(async (item) => {
            const serialNumberHasExist = await Equip.findOne({
              where: { serialNumber: item },
              attributes: [],
              paranoid: false,
              transaction,
            });

            if (serialNumberHasExist) {
              field.serialNumbers = true;
              message.serialNumbers = `${item} já está registrado`;
              throw new FieldValidationError([{ field, message }]);
            }
          });
          await Promise.all(serialNumbersFindPromises);

          const serialNumbersCreatePromises = serialNumbers.map(
            async (item) => {
              const equipCreate = {
                productBaseId: productBase.id,
                serialNumber: item,
                loan: false,
              };

              await Equip.create(equipCreate, { transaction });
            }
          );
          await Promise.all(serialNumbersCreatePromises);

          analysis = (
            parseInt(productBase.analysis, 10) - body.amount
          ).toString();

          preAnalysis = productBase.preAnalysis;

          amount = (parseInt(productBase.amount, 10) + body.amount).toString();

          available = (
            parseInt(productBase.available, 10) + body.amount
          ).toString();
        }
        break;
      case "preAnalysis":
        preAnalysis = (
          parseInt(productBase.preAnalysis, 10) - body.amount
        ).toString();

        analysis = (
          parseInt(productBase.analysis, 10) + body.amount
        ).toString();

        amount = productBase.amount;

        available = productBase.available;

        break;
      default:
        throw new FieldValidationError([{ field, message }]);
    }

    return await productBase.update(
      { analysis, preAnalysis, amount, available },
      { transaction }
    );
  }
};
