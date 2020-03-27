const router = require("express").Router({ mergeParams: true });
const productController = require("../../../../controllers/suprimentos/product");

router.post("", productController.create);
router.get("", productController.getAll);

module.exports = router;
