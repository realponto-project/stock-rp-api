const UserDomain = require(".")
const TypeAccount = require("./typeAccount")

const userDomain = new UserDomain()
const typeAccount = new TypeAccount()

describe("create user", () => {
  let typeAccountMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    typeAccountMock = {
      typeName: "TECNICO",
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: false,
      addEntry: false,
      addEquipType: false,
      tecnico: false,
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
      addStatus: false
    }
    await typeAccount.add(typeAccountMock)

    const userMock = {
      username: "teste01",
      typeName: "TECNICO",
      customized: false,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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
    await userDomain.user_Create(userMock)
  })

  it("create", async () => {
    expect.hasAssertions()
    const userMock = {
      username: "teste1",
      typeName: "TECNICO",
      customized: false,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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
    const userCreated = await userDomain.user_Create(userMock)

    expect(userCreated.username).toStrictEqual(userMock.username)
    expect(userCreated.typeAccount.typeName).toStrictEqual(userMock.typeName)

    expect(userCreated).not.toHaveProperty("login")
    expect(userCreated).not.toHaveProperty("password")
  })

  it("getResourceByUsername", async () => {
    expect.hasAssertions()
    const userMock = {
      username: "teste98",
      typeName: "TECNICO",
      customized: true,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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
    await userDomain.user_Create(userMock)

    const username = "teste98"

    const userReturn = await userDomain.getResourceByUsername(username)

    expect(userReturn.addCompany).toStrictEqual(userMock.addCompany)
    expect(userReturn.addPart).toStrictEqual(userMock.addPart)
    expect(userReturn.addAnalyze).toStrictEqual(userMock.addAnalyze)
    expect(userReturn.addEquip).toStrictEqual(false)
    expect(userReturn.addEntry).toStrictEqual(false)
  })
  it("getResourceByUsername customized", async () => {
    expect.hasAssertions()
    const userMock = {
      username: "teste99",
      typeName: "TECNICO",
      customized: true,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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
    await userDomain.user_Create(userMock)

    const username = "teste99"

    const userReturn = await userDomain.getResourceByUsername(username)

    expect(userReturn.addCompany).toStrictEqual(userMock.addCompany)
    expect(userReturn.addPart).toStrictEqual(userMock.addPart)
    expect(userReturn.addAnalyze).toStrictEqual(userMock.addAnalyze)
    expect(userReturn.addEquip).toStrictEqual(userMock.addEquip)
    expect(userReturn.addEntry).toStrictEqual(userMock.addEntry)
  })

  it("criar usuario sem premissões", async () => {
    expect.hasAssertions()
    const typeAccountTeste = {
      typeName: "NADINHA",
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      addEquipType: false,
      tecnico: false,
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
      addStatus: false
    }
    await typeAccount.add(typeAccountTeste)

    const userMock = {
      username: "nadinha",
      typeName: "NADINHA",
      customized: false,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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
    const userReturn = await userDomain.user_Create(userMock)

    expect(userReturn.username).toStrictEqual(userMock.username)
  })

  it("getAll", async () => {
    expect.hasAssertions()
    const users = await userDomain.getAll()
    expect(users.rows.length > 0).toBeTruthy()
  })
})
