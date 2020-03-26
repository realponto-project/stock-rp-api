const router = require("express").Router({ mergeParams: true });

const productRoute = require("./product");
const manufacturerRoute = require("./manufacturer");

router.use("/product", productRoute);
router.use("/manufacturer", manufacturerRoute);

module.exports = router;
