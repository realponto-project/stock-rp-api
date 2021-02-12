const router = require('express').Router({ mergeParams: true })
const technicianController = require('../../../controllers/estoque/technician')

router.post('', technicianController.add)
router.put('', technicianController.update)
router.get('', technicianController.getAll)
router.get('/getAllTechnician', technicianController.getAllTechnician)
router.get('/getByIdTechnician/:id', technicianController.getByIdTechnician)

module.exports = router
