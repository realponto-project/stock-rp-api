const router = require("express").Router({ mergeParams: true })
const typeAccountController = require("../../controllers/typeAccount")

router.post("", typeAccountController.add)
router.get("", typeAccountController.getAll)
router.get(
  "/getResourcesByTypeAccount",
  typeAccountController.getResourcesByTypeAccount
)
router.get("/getByIdTypeAccount/:id", typeAccountController.getByIdTypeAccount)

module.exports = router
