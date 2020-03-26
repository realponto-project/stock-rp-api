const router = require("express").Router({ mergeParams: true });

const carRoute = require("./estoque/car");
const companyRoute = require("./estoque/company");
const entranceRoute = require("./estoque/entrance");
const equipRoute = require("./estoque/equip");
const equipModelRoute = require("./estoque/equipModel");
const markRoute = require("./estoque/mark");
const productRoute = require("./estoque/product");
const reserveRoute = require("./estoque/reserve");
const stockRoute = require("./estoque/stock");
const technicianRoute = require("./estoque/technician");
const typeAccountRoute = require("./typeAccount");
const userRoute = require("./user");
const statusExpeditionRoute = require("./estoque/statusExpedition");
const emprestimoRoute = require("./estoque/emprestimo");
const consertoRoute = require("./estoque/conserto");
const suprimentosRoute = require("./suprimentos");

router.use("/car", carRoute);
router.use("/company", companyRoute);
router.use("/entrance", entranceRoute);
router.use("/equip", equipRoute);
router.use("/equipModel", equipModelRoute);
router.use("/mark", markRoute);
router.use("/product", productRoute);
router.use("/reserve", reserveRoute);
router.use("/stock", stockRoute);
router.use("/technician", technicianRoute);
router.use("/typeAccount", typeAccountRoute);
router.use("/user", userRoute);
router.use("/statusExpedition", statusExpeditionRoute);
router.use("/emprestimo", emprestimoRoute);
router.use("/conserto", consertoRoute);
router.use("/suprimentos", suprimentosRoute);

module.exports = router;
