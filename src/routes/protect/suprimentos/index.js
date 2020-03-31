const router = require("express").Router({ mergeParams: true });

const entranceRoute = require("./entrance");
const productRoute = require("./product");
const manufacturerRoute = require("./manufacturer");
const providerRoute = require("./provider");
const outRoute = require("./out");

router.use("/entrance", entranceRoute);
router.use("/product", productRoute);
router.use("/manufacturer", manufacturerRoute);
router.use("/provider", providerRoute);
router.use("/out", outRoute);

module.exports = router;
