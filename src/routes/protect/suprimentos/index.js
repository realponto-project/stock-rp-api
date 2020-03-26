const router = require("express").Router({ mergeParams: true });

const productRoute = require("./product");
const manufacturerRoute = require("./manufacturer");
const providerRoute = require("./provider");

router.use("/product", productRoute);
router.use("/manufacturer", manufacturerRoute);
router.use("/provider", providerRoute);

module.exports = router;
