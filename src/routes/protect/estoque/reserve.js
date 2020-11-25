const router = require("express").Router({ mergeParams: true })
const reserveController = require("../../../controllers/estoque/reserve")

router.post("/RInterno", reserveController.createReservaInterno)
router.get("/RInterno", reserveController.getAllReservaInterno)
router.post("/reservaTecnico", reserveController.createReservaTecnico)
router.get("/reservaTecnico", reserveController.getAllReservaTecnico)
router.put(
  "/reservaTecnico/associarEquipParaOsPart",
  reserveController.associarEquipParaOsPart
)
router.put(
  "/reservaTecnico/associarEquipsParaOsPart",
  reserveController.associarEquipsParaOsPart
)
router.get(
  "/reservaTecnico/return",
  reserveController.getAllReservaTecnicoForReturn
)
router.post("/OS", reserveController.addOs)
router.put("/OS", reserveController.updateOs)
router.delete("/OS", reserveController.deleteOs)
router.delete("/OsPart", reserveController.deleteOsPart)
router.get("/OS", reserveController.getAllOs)
router.put("/OS/finalizarCheckout", reserveController.finalizarCheckout)
router.get("/getAllOsPartsByParams", reserveController.getAllOsPartsByParams)
router.get("/getAllOsParts", reserveController.getAllOsParts)
router.get(
  "/getAllOsPartsByParams/return",
  reserveController.getAllOsPartsByParamsForReturn
)
router.get("/getOsByOs", reserveController.getOsByOs)
router.put("/output", reserveController.output)
router.put("/returnOutput", reserveController.returnOutput)
router.post("/kit", reserveController.addKit)
router.get("/kit", reserveController.getAllKit)
router.get("/kitDefaultValue", reserveController.getKitDefaultValue)
router.post("/kitOut", reserveController.addKitOut)
router.get("/kitOut", reserveController.getAllKitOut)
router.post("/freeMarket", reserveController.addFreeMarket)
router.get("/freeMarket", reserveController.getAllFreeMarket)

module.exports = router
