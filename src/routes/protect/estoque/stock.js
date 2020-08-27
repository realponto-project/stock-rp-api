const router = require("express").Router({ mergeParams: true });
const stockController = require("../../../controllers/estoque");

router.get("", stockController.getAll);
router.put("/updateProductBase", stockController.updatteProductBase);

module.exports = router;
