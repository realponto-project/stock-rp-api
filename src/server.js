const Express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = Express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', (req, res, next) => res.json({ deu: 'bom' }))

module.exports = app 