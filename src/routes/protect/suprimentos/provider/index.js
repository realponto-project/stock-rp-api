const router = require("express").Router({ mergeParams: true })
const providerController = require("../../../../controllers/suprimentos/provider")

router.post("", providerController.create)
router.put("", providerController.update)
router.get("", providerController.getAll)
router.get("/getProviderById/:id", providerController.getByIdProvider)

module.exports = router
