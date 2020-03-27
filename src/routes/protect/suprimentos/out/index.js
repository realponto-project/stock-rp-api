const router = require("express").Router({ mergeParams: true });
const outController = require("../../../../controllers/suprimentos/supOut");

router.post("", outController.create);
router.get("", outController.getAll);

module.exports = router;
