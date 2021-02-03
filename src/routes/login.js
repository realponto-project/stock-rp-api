const router = require('express').Router({ mergeParams: true })
const { signIn } = require('../controllers/Auth')

router.post('/login', signIn)

module.exports = router
