const router = require("express").Router({ mergeParams: true });
const manufacturerController = require("../../../../controllers/suprimentos/manufacturer");

router.post("", manufacturerController.create);

module.exports = router;
