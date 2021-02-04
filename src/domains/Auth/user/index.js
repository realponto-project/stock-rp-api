const R = require('ramda')

const {
  FieldValidationError,
  UnauthorizedError,
  NotFoundError
} = require('../../../helpers/errors')

const database = require('../../../database')
const formatQuery = require('../../../helpers/lazyLoad')

const User = database.model('user')
const TypeAccount = database.model('typeAccount')
const Resources = database.model('resources')

class UserDomain {
  // eslint-disable-next-line camelcase
  async user_Create(bodyData, options = {}) {
    const { transaction = null } = options

    const userNotFormatted = bodyData

    const { typeName } = bodyData

    const typeAccountRetorned = await TypeAccount.findOne({
      where: { typeName },
      include: [{ model: Resources }],
      transaction
    })

    if (!typeAccountRetorned) {
      throw new FieldValidationError([
        {
          field: 'typeName',
          message: 'typeName invalid'
        }
      ])
    }

    bodyData.typeAccountId = typeAccountRetorned.id

    const { responsibleUser } = bodyData

    if (
      !(await User.findOne({
        where: { username: responsibleUser }
      })) &&
      bodyData.responsibleUser !== 'modrp'
    ) {
      throw new FieldValidationError([
        {
          field: 'responsibleUser',
          message: 'username inválido.'
        }
      ])
    }

    const { permissions } = bodyData

    if (bodyData.customized) {
      const resourcesRenorned = await Resources.create(permissions, {
        transaction
      })

      bodyData.resourceId = resourcesRenorned.id
    }

    const formatBody = R.evolve({ username: R.pipe(R.toLower(), R.trim()) })

    const user = formatBody(bodyData)

    const password = R.prop('username', user)

    const userFormatted = {
      ...user,
      password
    }

    const userCreated = await User.create(userFormatted, {
      transaction
    })

    let userReturned = null

    if (userNotFormatted.customized) {
      userReturned = await User.findByPk(userCreated.id, {
        include: [{ model: TypeAccount }, { model: Resources }]
      })
    } else {
      userReturned = await User.findByPk(userCreated.id, {
        include: [
          {
            model: TypeAccount,
            include: [{ model: Resources }]
          }
        ]
      })
    }

    return userReturned
  }

  // eslint-disable-next-line camelcase
  async user_PasswordUpdate(bodyData, options = {}) {
    const { transaction = null } = options

    const hasUsername = R.has('username', bodyData)

    const hasOldPassword = R.has('oldPassword', bodyData)

    const hasNewPassword = R.has('newPassword', bodyData)

    if (!hasUsername || !bodyData.username) {
      throw new FieldValidationError([
        {
          name: 'username',
          message: 'username cannot to be null'
        }
      ])
    }

    if (!hasOldPassword || !bodyData.oldPassword) {
      throw new FieldValidationError([
        {
          name: 'oldPassword',
          message: 'oldPassword cannot to be null'
        }
      ])
    }

    if (!hasNewPassword || !bodyData.newPassword) {
      throw new FieldValidationError([
        {
          name: 'newPassword',
          message: 'newPassword cannot to be null'
        }
      ])
    }

    const getBody = R.applySpec({
      username: R.prop('username'),
      oldPassword: R.prop('oldPassword'),
      newPassword: R.prop('newPassword')
    })

    const body = getBody(bodyData)

    const user = await User.findOne({
      where: { username: body.username },
      transaction
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    if (!(await user.checkPassword(body.oldPassword))) {
      throw new UnauthorizedError()
    }

    return await user.update({ password: body.newPassword })
  }

  // eslint-disable-next-line camelcase
  async user_UpdateById(id, bodyData, options = {}) {
    const { transaction = null } = options

    let newUser = {}

    const user = R.omit(['id', 'username'], bodyData)

    const hasName = R.has('name', user)

    const hasEmail = R.has('email', user)

    if (hasEmail) {
      newUser = {
        ...newUser,
        email: R.prop('email', user)
      }

      if (!user.email) {
        throw new FieldValidationError([
          {
            name: 'email',
            message: 'email cannot be null'
          }
        ])
      }

      const email = await User.findOne({
        where: { email: user.email },
        transaction
      })

      if (email) {
        throw new FieldValidationError([
          {
            field: 'email',
            message: 'email already exist'
          }
        ])
      }
    }

    if (hasName) {
      newUser = {
        ...newUser,
        name: R.prop('name', user)
      }

      if (!user.name) {
        throw new FieldValidationError([
          {
            name: 'name',
            message: 'name cannot be null'
          }
        ])
      }
    }

    const userInstance = await User.findByPk(id, { transaction })

    await userInstance.update(newUser)

    const userUpdated = await User.findByPk(id, { transaction })

    return userUpdated
  }

  async getResourceByUsername(username, options = {}) {
    const { transaction = null } = options

    const user = await User.findOne({
      where: { username },
      transaction
    })

    let userResources = null
    let response = null

    const { customized } = user

    if (customized) {
      userResources = await User.findByPk(user.id, {
        include: [{ model: Resources }],
        transaction
      })

      response = {
        addCompany: userResources.resource.addCompany,
        addPart: userResources.resource.addPart,
        addAnalyze: userResources.resource.addAnalyze,
        addEquip: userResources.resource.addEquip,
        addEntry: userResources.resource.addEntry,
        addEquipType: userResources.resource.addEquipType,
        tecnico: userResources.resource.tecnico,
        addAccessories: userResources.resource.addAccessories,
        addUser: userResources.resource.addUser,
        addTypeAccount: userResources.resource.addTypeAccount,
        addTec: userResources.resource.addTec,
        addCar: userResources.resource.addCar,
        addMark: userResources.resource.addMark,
        addType: userResources.resource.addType,
        addProd: userResources.resource.addProd,
        addFonr: userResources.resource.addFonr,
        addEntr: userResources.resource.addEntr,
        addKit: userResources.resource.addKit,
        addKitOut: userResources.resource.addKitOut,
        addOutPut: userResources.resource.addOutPut,
        addROs: userResources.resource.addROs,
        addRML: userResources.resource.addRML,
        gerROs: userResources.resource.gerROs,
        delROs: userResources.resource.delROs,
        updateRos: userResources.resource.updateRos,
        addStatus: userResources.resource.addStatus,
        suprimento: userResources.resource.suprimento,
        modulo: userResources.resource.modulo
      }
    } else {
      userResources = await User.findByPk(user.id, {
        include: [
          {
            model: TypeAccount,
            include: [{ model: Resources }]
          }
        ],
        transaction
      })

      response = {
        addCompany: userResources.typeAccount.resource.addCompany,
        addPart: userResources.typeAccount.resource.addPart,
        addAnalyze: userResources.typeAccount.resource.addAnalyze,
        addEquip: userResources.typeAccount.resource.addEquip,
        addEntry: userResources.typeAccount.resource.addEntry,
        addEquipType: userResources.typeAccount.resource.addEquipType,
        tecnico: userResources.typeAccount.resource.tecnico,
        addAccessories: userResources.typeAccount.resource.addAccessories,
        addUser: userResources.typeAccount.resource.addUser,
        addTypeAccount: userResources.typeAccount.resource.addTypeAccount,
        addTec: userResources.typeAccount.resource.addTec,
        addCar: userResources.typeAccount.resource.addCar,
        addMark: userResources.typeAccount.resource.addMark,
        addType: userResources.typeAccount.resource.addType,
        addProd: userResources.typeAccount.resource.addProd,
        addFonr: userResources.typeAccount.resource.addFonr,
        addEntr: userResources.typeAccount.resource.addEntr,
        addKit: userResources.typeAccount.resource.addKit,
        addKitOut: userResources.typeAccount.resource.addKitOut,
        addOutPut: userResources.typeAccount.resource.addOutPut,
        addROs: userResources.typeAccount.resource.addROs,
        addRML: userResources.typeAccount.resource.addRML,
        gerROs: userResources.typeAccount.resource.gerROs,
        delROs: userResources.typeAccount.resource.delROs,
        updateRos: userResources.typeAccount.resource.updateRos,
        addStatus: userResources.typeAccount.resource.addStatus,
        suprimento: userResources.typeAccount.resource.suprimento,
        modulo: userResources.typeAccount.resource.modulo
      }
    }

    return response
  }

  // eslint-disable-next-line camelcase
  async user_Update(bodyData, options = {}) {
    const { transaction = null } = options

    console.log('bodyData1')
    // console.log(bodyData)

    const userNotFormatted = bodyData

    const oldUser = await User.findByPk(bodyData.id, {
      include: [{ model: Resources }],
      transaction
    })

    const { typeName } = userNotFormatted

    const typeAccountRetorned = await TypeAccount.findOne({
      where: { typeName },
      include: [{ model: Resources }],
      transaction
    })
    console.log('bodyData2')

    if (!typeAccountRetorned) {
      throw new FieldValidationError([
        {
          field: 'typeName',
          message: 'typeName invalid'
        }
      ])
    }

    console.log('bodyData3')
    userNotFormatted.typeAccountId = typeAccountRetorned.id

    const { responsibleUser } = bodyData

    const user = await User.findOne({
      where: { username: responsibleUser },
      transaction
    })

    if (!user && bodyData.responsibleUser !== 'modrp') {
      throw new FieldValidationError([
        {
          field: 'responsibleUser',
          message: 'responsibleUser invalid'
        }
      ])
    }
    console.log('bodyData4')

    const { permissions } = bodyData

    if (userNotFormatted.customized) {
      console.log('bodyData5')
      if (oldUser.customized) {
        console.log('bodyData6')
        const resourceUpdate = {
          ...oldUser.resource,
          ...permissions
        }
        console.log('bodyData7')
        const resourcesRenorned = await oldUser.resource.update(
          resourceUpdate,
          { transaction }
        )
        console.log('bodyData8')

        userNotFormatted.resourceId = resourcesRenorned.id
      } else {
        const resourcesRenorned = await Resources.create(permissions, {
          transaction
        })

        userNotFormatted.resourceId = resourcesRenorned.id
      }
    } else if (oldUser.customized) {
      await oldUser.update({ resourceId: null }, { transaction })
      await oldUser.resource.destroy({ force: true, transaction })
    }

    const newUser = {
      ...oldUser,
      ...userNotFormatted
    }

    await oldUser.update(newUser, { transaction })

    return await User.findByPk(bodyData.id, {
      include: [
        {
          model: TypeAccount,
          include: [{ model: Resources }]
        },
        { model: Resources }
      ]
    })
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: 'username',
      acendent: false,
      direction: 'DESC'
    }

    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const newOrder = query && query.order ? query.order : inicialOrder

    if (newOrder.acendent) {
      newOrder.direction = 'DESC'
    } else {
      newOrder.direction = 'ASC'
    }

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery)

    const users = await User.findAndCountAll({
      where: {
        ...getWhere('user')
        // username: { [operators.ne]: 'modrp' }
      },
      include: [
        {
          model: TypeAccount,
          where: getWhere('typeAccount'),
          include: { model: Resources }
        },
        { model: Resources }
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction
    })

    const { rows } = users

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: users.count,
        rows: []
      }
    }

    const formatData = R.map(user => {
      const resp = {
        id: user.id,
        username: user.username,
        customized: user.customized,
        typeName: user.typeAccount.typeName,
        resource: user.customized ? user.resource : user.typeAccount.resource
      }
      return resp
    })

    const usersList = formatData(rows)

    let show = limit
    if (users.count < show) {
      show = users.count
    }

    const response = {
      page: pageResponse,
      show,
      count: users.count,
      rows: usersList
    }
    return response
  }

  async getById({ id }) {
    const user = await User.findByPk(id, {
      exclude: ['password'],
      include: [
        {
          model: TypeAccount,
          include: [Resources]
        },
        Resources
      ]
    })

    if (!user) {
      throw new NotFoundError()
    }

    return user
  }
}

module.exports = UserDomain
