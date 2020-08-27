const Sequelize = require("sequelize");
const moment = require("moment");

const database = require("../../database");

const models = require("../../database/models");
const { response } = require("express");
const { Op } = Sequelize;

const Login = database.model("login"),
  Resources = database.model("resources"),
  Session = database.model("session"),
  TypeAccount = database.model("typeAccount"),
  User = database.model("user"),
  Company = database.model("company"),
  Accessories = database.model("accessories"),
  Car = database.model("car"),
  Entrance = database.model("entrance"),
  Equip = database.model("equip"),
  EquipType = database.model("equipType"),
  FreeMarket = database.model("freeMarket"),
  FreeMarketParts = database.model("freeMarketParts"),
  Kit = database.model("kit"),
  KitOut = database.model("kitOut"),
  KitParts = database.model("kitParts"),
  KitPartsOut = database.model("kitPartsOut"),
  Product = database.model("product"),
  Mark = database.model("mark"),
  Notification = database.model("notification"),
  Os = database.model("os"),
  OsParts = database.model("osParts"),
  StockBase = database.model("stockBase"),
  Technician = database.model("technician"),
  ProductBase = database.model("productBase"),
  StatusExpedition = database.model("statusExpedition"),
  Emprestimo = database.model("emprestimo"),
  SupEntrance = database.model("supEntrance"),
  SupProduct = database.model("supProduct"),
  Manufacturer = database.model("manufacturer"),
  SupProvider = database.model("supProvider"),
  SupOut = database.model("supOut"),
  SupContact = database.model("supContact");

const deleteEComerce = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const resp = await FreeMarket.findOne({
      where: { trackingCode: "OI202442267BR" },
      include: [{ model: ProductBase }],
      transaction,
      paranoid: false,
    });

    await Promise.all(
      resp.productBases.map(async (item) => {
        const equip = await Equip.findAll({
          where: { freeMarketPartId: item.freeMarketParts.id },
          paranoid: false,
          transaction,
        });

        const productBase = await ProductBase.findByPk(item.id, {
          transaction,
        });

        // await productBase.update(
        //   {
        //     amount:
        //       parseInt(item.amount, 10) +
        //       parseInt(item.freeMarketParts.amount, 10),
        //     available:
        //       parseInt(item.available, 10) +
        //       parseInt(item.freeMarketParts.amount, 10)
        //   },
        //   { transaction }
        // );

        // await Promise.all(
        //   equip.map(async equipItem => {
        //     await equipItem.restore({ transaction });
        //     await equipItem.update({ freeMarketPartId: null }, { transaction });
        //   })
        // );

        const freeMarketPart = await FreeMarketParts.findByPk(
          item.freeMarketParts.id,
          { transaction }
        );

        // await freeMarketPart.destroy({ force: true, transaction });
      })
    );

    // await resp.dest\roy({ force: true, transaction });

    await transaction.commit();
    res.json(resp);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const writeDefautsEntrances = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const entrances = await Entrance.findAll({ transaction });

    await Promise.all(
      entrances.map(
        async (entrance) =>
          await entrance.update({ analysis: false }, { transaction })
      )
    );

    const producBtases = await ProductBase.findAll({ transaction });

    await Promise.all(
      producBtases.map(
        async (producBtase) =>
          await producBtase.update({ analysis: "0" }, { transaction })
      )
    );

    await transaction.commit();
    res.json("sucess");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const writeDefautsProducts = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const products = await Product.findAll({
      paranoid: false,
      transaction,
    });

    await Promise.all(
      products.map(async (product) => {
        await product.update(
          { corredor: "", coluna: "", prateleira: "", gaveta: "" },
          { transaction }
        );
      })
    );
    await transaction.commit();
    res.json("sucess");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getBug = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    // const os = await Os.findAll({
    //   include: [
    //     {
    //       model: ProductBase,
    //       include: [
    //         {
    //           model: Product,
    //           where: { name: "IMPRESSORA PRINT ID TOUCH" },
    //         },
    //       ],
    //       through: {
    //         paranoid: false,
    //       },
    //       required: true,
    //     },
    //     //   { model: Product, where: { name: "IMPRESSORA PRINT ID TOUCH" } },
    //   ],
    //   paranoid: false,
    //   transaction,
    // });

    // console.log(JSON.parse(JSON.stringify(os)));

    const producBase = await ProductBase.findOne({
      where: { id: "31c2df5e-e3f5-44f8-843a-5101d79a6190" },
      include: [
        { model: Product, where: { serial: true } },
        { model: StockBase, where: { stockBase: { [Op.ne]: "EMPRESTIMO" } } },
      ],
      // limit: 2,
      transaction,
    });

    // await Promise.all(
    //   producBases.map(async (producBase) => {
    //     const equipsAmount = await Equip.count({
    //       where: { productBaseId: producBase.id, deletedAt: { [Op.eq]: null } },
    //       paranoid: false,
    //       transaction,
    //     });
    //     const equipsAvailable = await Equip.count({
    //       where: {
    //         productBaseId: producBase.id,
    //         deletedAt: { [Op.eq]: null },
    //         reserved: false,
    //       },
    //       paranoid: false,
    //       transaction,
    //     });
    //     const equipsReserved = await Equip.count({
    //       where: {
    //         productBaseId: producBase.id,
    //         deletedAt: { [Op.eq]: null },
    //         reserved: true,
    //       },
    //       paranoid: false,
    //       transaction,
    //     });

    //     await producBase.update(
    //       {
    //         amount: equipsAmount,
    //         available: equipsAvailable,
    //         reserved: equipsReserved,
    //       },
    //       {
    //         transaction,
    //       }
    //     );
    //   })
    // );

    console.log(JSON.parse(JSON.stringify(producBase)));

    await producBase.update({ amount: "0" }, { transaction });

    console.log(JSON.parse(JSON.stringify(producBase)));

    await transaction.commit();
    res.json("response");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const findAllTable = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    //     await Entrance.findAll({
    //       where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //       transaction,
    //       await ProductBase.findAll({
    //         where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //         transaction,
    //       })
    // await FreeMarketParts.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // });
    // await Product.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // await Os.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // await OsParts.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // await TechnicianReserve.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // await TechnicianReserveParts.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // });
    // await Emprestimo.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // await SupProduct.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   transaction,
    // })
    // console.log(
    //   JSON.parse(
    //     JSON
    //       .stringify
    //       // await Equip.findAll({
    //       //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //       //   paranoid: false,
    //       //   transaction,
    //       // })
    //       ()
    //   )
    // );

    // const freeMarkets = await FreeMarket.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   include: [
    //     {
    //       model: ProductBase,
    //       include: [{ model: Product }, { model: StockBase }],
    //     },
    //   ],
    //   transaction,
    // });

    // let response = [];

    // await Promise.all(
    //   freeMarkets.map(async (freeMarket) => {
    //     const {
    //       trackingCode: codigo,
    //       cnpjOrCpf: cnpj,
    //       name: razaosocial,
    //       productBases,
    //     } = freeMarket;

    //     await Promise.all(
    //       productBases.map(async (productBase) => {
    //         const {
    //           stockBase: { stockBase: estoque },
    //           product: { name: produto, serial },
    //           freeMarketParts: { amount: quantidade, id },
    //         } = productBase;
    //         // console.log(JSON.parse(JSON.stringify(productBase)));
    //         if (serial) {
    //           console.log(id);
    //           const equips = await Equip.findAll({
    //             attributes: ["serialNumber"],
    //             where: {
    //               updatedAt: { [Op.gte]: new Date("07/02/2020") },
    //               freeMarketPartId: id,
    //             },
    //             paranoid: false,
    //             transaction,
    //           });

    //           console.log(JSON.parse(JSON.stringify(equips)));
    //           response = [
    //             ...response,
    //             {
    //               codigo,
    //               cnpj,
    //               razaosocial,
    //               estoque,
    //               produto,
    //               quantidade,
    //               equips,
    //             },
    //           ];
    //         } else {
    //           response = [
    //             ...response,
    //             { codigo, cnpj, razaosocial, estoque, produto, quantidade },
    //           ];
    //         }
    //         return;
    //       })
    //     );
    //     return;
    //   })
    // );

    // await SupOut.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   include: [{ model: SupProduct }],
    //   transaction,
    // })
    // const response = await SupOut.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   include: [{ model: SupProduct }],
    //   transaction,
    // });

    // const internos = await TechnicianReserve.findAll({
    //   where: { updatedAt: { [Op.gte]: new Date("07/02/2020") } },
    //   include: [
    //     { model: Technician },
    //     {
    //       model: ProductBase,
    //       include: [{ model: Product }, { model: StockBase }],
    //     },
    //   ],
    //   transaction,
    // });

    // console.log(JSON.parse(JSON.stringify(internos)));

    // let response = [];

    // internos.map((interno) => {
    //   const {
    //     razaoSocial,
    //     date,
    //     technician: { name: tecnico },
    //     productBases,
    //   } = interno;

    //   productBases.map((productBase) => {
    //     const {
    //       stockBase: { stockBase: estoque },
    //       product: { name: produto },
    //       technicianReserveParts: { amount: quantidade },
    //     } = productBase;

    //     response = [
    //       ...response,
    //       { date, tecnico, razaoSocial, estoque, produto, quantidade },
    //     ];
    //   });
    // });

    await transaction.commit();
    res.json(response);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
const pdfStock = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    // const products = await Product.findAll({
    //   include: [{ model: StockBase, required: true }],
    //   order: [["name", "ASC"]],
    //   transaction,
    // });

    const equips = await Equip.findAll({
      include: [
        {
          model: ProductBase,
          required: true,
          include: [
            {
              model: StockBase,
              where: { stockBase: { [Op.ne]: "EMPRESTIMO" } },
            },
          ],
        },
      ],
      transaction,
    });

    console.log(JSON.parse(JSON.stringify(equips)));

    await Promise.all(
      equips.map(async (equip) => {
        await equip.destroy({ transaction });
      })
    );

    // await serialNumberHasExist.restore({ transaction });

    // const supProducts = await SupProduct.findAll({ transaction });

    // await Promise.all(
    //   supProducts.map(async (supProduct) => {
    //     await supProduct.update({ amount: 0 }, { transaction });
    //   })
    // );

    // const productBases = await ProductBase.findAll({
    //   transaction,
    // });

    // await Promise.all(
    //   productBases.map(async (productBase) => {
    //     await productBase.update(
    //       { amount: "0", available: "0", reserved: "0" },
    //       { transaction }
    //     );
    //   })
    // );
    // console.log(
    //   JSON.parse(
    //     JSON.stringify(
    //       await Product.findOne({
    //         include: [{ model: StockBase, required: true }],
    //         transaction,
    //       })
    //     )
    //   )
    // );

    await transaction.commit();
    res.json("sucess");
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
module.exports = {
  deleteEComerce,
  writeDefautsEntrances,
  writeDefautsProducts,
  findAllTable,
  pdfStock,
  getBug,
};
