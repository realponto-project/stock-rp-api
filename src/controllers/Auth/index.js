const { signIn } = require('../../domains/Auth/Session')

class AuthController {
  async signIn(req, res, next) {
    try {
      const resp = await signIn(req.body)
      res.json(resp)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new AuthController()
