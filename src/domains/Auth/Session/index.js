const yup = require('yup')

const database = require('../../../database')
const { responseSigInSpec } = require('./specs')

const Resources = database.model('resources')
const TypeAccount = database.model('typeAccount')
const User = database.model('user')

class SessionDomain {
  async signIn(bodyData) {
    const schema = yup.object().shape({
      username: yup.string().required(),
      password: yup.string().required()
    })

    await schema.validate(bodyData, {
      abortEarly: false
    })

    const { username, password } = bodyData

    const user = await User.findOne({
      where: { username },
      include: [{ model: TypeAccount, include: [Resources] }, Resources]
    })

    console.log(JSON.parse(JSON.stringify(user)))

    if (!user) throw new Error('User not found')

    if (!(await user.checkPassword(password))) {
      throw new Error('unvalid password')
    }

    return responseSigInSpec(user)
  }
}

module.exports = new SessionDomain()
