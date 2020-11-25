// const R = require('ramda')

const EquipModelDomain = require("./index")

const { FieldValidationError } = require("../../../../../helpers/errors")

const equipModelDomain = new EquipModelDomain()

describe("equipModelDomain", () => {
  it("create equipType", async () => {
    expect.hasAssertions()
    const equipTypeMock = {
      type: "CONTROLE DE ACESSO",
      responsibleUser: "modrp"
    }

    const equipTypeCreated = await equipModelDomain.addType(equipTypeMock)

    expect(equipTypeCreated.type).toBe(equipTypeMock.type)
    expect(equipTypeCreated.responsibleUser).toBe(equipTypeMock.responsibleUser)

    await expect(equipModelDomain.addType(equipTypeMock))
      .rejects.toThrow(new FieldValidationError())
  })

  it("getAllType", async () => {
    expect.hasAssertions()
    const equipTypes = await equipModelDomain.getAllType()

    expect(equipTypes.length > 0).toBe(true)
  })
})
