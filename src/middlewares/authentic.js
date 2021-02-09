const { promisify } = require('util')
const { verify } = require('jsonwebtoken')

const { UnauthorizedError } = require('../helpers/errors')

const auth = async (req, res, next) => {
  try {
    const token = req.get('token')

    await promisify(verify)(token, process.env.APP_SECRET)

    next()
  } catch (error) {
    next(new UnauthorizedError())
  }
}

module.exports = { auth }
