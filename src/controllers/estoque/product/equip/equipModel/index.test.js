const request = require("../../../../../helpers/request")

describe("equipModelController", () => {
  let equipTypeMock = null
  let headers = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    equipTypeMock = {
      type: "CATRACA",
      responsibleUser: "modrp"
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

  it("create equipType", async () => {
    expect.hasAssertions()
    const response = await request().post("/api/equipModel/addType", equipTypeMock, { headers })

    expect(response.statusCode).toBe(200)
    expect(response.body.type).toBe(equipTypeMock.type)
  })

  it("getAllTypes", async () => {
    expect.hasAssertions()
    const resposta = await request().get("/api/equipModel/getAllType", { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
