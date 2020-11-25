const R = require("ramda")

const TypeAccountDomain = require("./")

const { FieldValidationError } = require("../../../../helpers/errors")

const typeAccountDomain = new TypeAccountDomain()

describe("typeAccountDomain", () => {
  let typeAccountMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(() => {
    typeAccountMock = {
      typeName: "Adm",
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
  })

  it("create", async () => {
    expect.hasAssertions()
    const typeAccountCreated = await typeAccountDomain.add(typeAccountMock)

    expect(typeAccountCreated.typeName).toBe(typeAccountMock.typeName)
    expect(typeAccountCreated.resource.addCompany).toBe(
      typeAccountMock.addCompany
    )
    expect(typeAccountCreated.resource.addPart).toBe(typeAccountMock.addPart)
    expect(typeAccountCreated.resource.addAnalyze).toBe(
      typeAccountMock.addAnalyze
    )
    expect(typeAccountCreated.resource.addEquip).toBe(false)
    expect(typeAccountCreated.resource.addEntry).toBe(false)

    await expect(typeAccountDomain.add(typeAccountMock)).rejects.toThrow(
      new FieldValidationError()
    )
  })

  it("try add typeAccount with typeName null", async () => {
    expect.hasAssertions()
    const typeAccountCreated = typeAccountMock
    typeAccountCreated.typeName = ""

    await expect(
      typeAccountDomain.add(typeAccountCreated)
    ).rejects.toThrow(
      new FieldValidationError([
        {
          field: "typeName",
          message: "typeName cannot be null"
        }
      ])
    )
  })

  it("try add typeAccount without typeName", async () => {
    expect.hasAssertions()
    const typeAccountCreated = R.omit(["typeName"], typeAccountMock)

    await expect(
      typeAccountDomain.add(typeAccountCreated)
    ).rejects.toThrow(
      new FieldValidationError([
        {
          field: "typeName",
          message: "typeName cannot be null"
        }
      ])
    )
  })

  it("getAll", async () => {
    expect.hasAssertions()
    const typeAccounts = await typeAccountDomain.getAll()
    expect(typeAccounts.rows.length > 0).toBeTruthy()
  })

  it("getResourcesByTypeAccount", async () => {
    expect.hasAssertions()
    const typeAccount = await typeAccountDomain.getResourcesByTypeAccount()

    expect(typeAccount.typeName).toBeTruthy()
  })
})
