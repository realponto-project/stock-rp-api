const router = require("express").Router({ mergeParams: true });
const providerController = require("../../../../controllers/suprimentos/provider");

router.post("", providerController.create);
router.get("", providerController.getAll);

module.exports = router;
