const router = require("express").Router({ mergeParams: true })
const manufacturerController = require("../../../../controllers/suprimentos/manufacturer")

router.post("", manufacturerController.create)
router.put("", manufacturerController.update)
router.get("", manufacturerController.getAll)

module.exports = router
