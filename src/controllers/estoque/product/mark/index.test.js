const request = require("../../../../helpers/request")

describe("markController", () => {
  let markMock = null
  let headers = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    markMock = {
      mark: "TESTE6",
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

  it("create", async () => {
    expect.hasAssertions()
    const response = await request().post("/api/mark", markMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.mark).toBe(markMock.mark)
    expect(body.responsibleUser).toBe(markMock.responsibleUser)
  })

  it("getAll", async () => {
    expect.hasAssertions()
    const resposta = await request().get("/api/mark", { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
