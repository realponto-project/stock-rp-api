const router = require("express").Router({ mergeParams: true });
const productController = require("../../../../controllers/suprimentos/product");

router.post("", productController.create);

module.exports = router;
