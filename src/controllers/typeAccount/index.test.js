const request = require('../../helpers/request')

describe('typeAccountController', () => {
  let headers = null
  let typeAccountMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    typeAccountMock = {
      typeName: 'ADM',
      addCompany: true,
      addPart: false,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
      addUser: false,
      addTypeAccount: false,
      responsibleUser: 'modrp',
      stock: false,
      labTec: true,
      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
      addStatus: false,
      suprimento: false
    }

    const loginBody = {
      username: 'modrp',
      password: 'modrp',
      typeAccount: { labTec: true }
    }

    const login = await request().post('/oapi/login', loginBody)

    const { token, username } = login.body

    headers = {
      token,
      username
    }
  })

  it('create', async () => {
    expect.assertions(7)
    const response = await request().post('/api/typeAccount', typeAccountMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.typeName).toBe(typeAccountMock.typeName)
    expect(body.resource.addCompany).toBe(typeAccountMock.addCompany)
    expect(body.resource.addPart).toBe(typeAccountMock.addPart)
    expect(body.resource.addAnalyze).toBe(typeAccountMock.addAnalyze)
    expect(body.resource.addEquip).toBe(typeAccountMock.addEquip)
    expect(body.resource.addEntry).toBe(typeAccountMock.addEntry)
  })

  it('getall', async () => {
    expect.hasAssertions()
    const response = await request().get('/api/typeAccount', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.rows).toBeTruthy()
  })

  it('getResourcesByTypeAccount', async () => {
    expect.hasAssertions()
    const response = await request().get(
      '/api/typeAccount/getResourcesByTypeAccount',
      { headers }
    )

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })
})
