const router = require("express").Router({ mergeParams: true })
const equipController = require("../../../controllers/equip")

router.get("", equipController.getAll)
router.post("", equipController.add)
router.get("/serialNumber", equipController.getOneBySerialNumber)
router.put("/update", equipController.update)
router.delete("", equipController.delet)

module.exports = router
