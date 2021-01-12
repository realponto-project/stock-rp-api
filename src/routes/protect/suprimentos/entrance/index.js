const router = require("express").Router({ mergeParams: true })
const entranceController = require("../../../../controllers/suprimentos/entrance")

router.post("", entranceController.create)
router.get("", entranceController.getAll)

module.exports = router
