const request = require("../../helpers/request")

const TypeAccount = require("../../domains/auth/user/typeAccount")

const typeAccount = new TypeAccount()

describe("userController", () => {
  let headers = null
  let typeAccountMock = null
  let userMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    typeAccountMock = {
      typeName: "TecnicoLab",
      addCompany: false,
      addPart: false,
      addAnalyze: true,
      addEquip: false,
      addEntry: true,
      addEquipType: false,
      tecnico: true,
      addAccessories: false,
      addUser: false,
      addTypeAccount: false,
      responsibleUser: "modrp",
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

    await typeAccount.add(typeAccountMock)

    userMock = {
      username: "matheus",
      typeName: "TecnicoLab",
      customized: false,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: true,
      tecnico: true,
      addAccessories: true,
      addUser: true,
      addTypeAccount: true,
      responsibleUser: "modrp",
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
      addStatus: false
    }

    const loginBody = {
      username: "modrp",
      password: "modrp",
      typeAccount: { labTec: true }
    }

    const login = await request().post("/oapi/login", loginBody)

    const { token, username } = login.body

    headers = {
      token,
      username
    }
  })

  it("create", async () => {
    expect.hasAssertions()
    const response = await request().post("/api/user", userMock, { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  it("getResourceByUsername", async () => {
    expect.hasAssertions()
    userMock = {
      username: "alvaro",
      typeName: "TecnicoLab",
      customized: true,
      addCompany: false,
      addPart: false,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: true,
      tecnico: true,
      addAccessories: true,
      addUser: false,
      addTypeAccount: false,
      responsibleUser: "modrp",
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
      addStatus: false
    }

    await request().post("/api/user", userMock, { headers })

    const params = { username: "alvaro" }
    const response = await request().get("/api/user/getResourceByUsername", {
      headers,
      params
    })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.addCompany).toBe(userMock.addCompany)
    expect(body.addPart).toBe(userMock.addPart)
    expect(body.addAnalyze).toBe(userMock.addAnalyze)
    expect(body.addEquip).toBe(userMock.addEquip)
    expect(body.addEntry).toBe(userMock.addEntry)
  })

  it("getall, query", async () => {
    expect.hasAssertions()
    const params = { query: { filters: { typeAccount: { specific: { typeName: "TecnicoLab" } } } } }

    const response = await request().get("/api/user/getAll", {
      headers,
      params
    })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBeTruthy()
  })
})
