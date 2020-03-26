const router = require("express").Router({ mergeParams: true });
const providerController = require("../../../../controllers/suprimentos/provider");

router.post("", providerController.create);

module.exports = router;
