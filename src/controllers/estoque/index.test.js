const request = require("../../helpers/request")

describe("stockController", () => {
  let headers = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
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

  it("getall, query", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/stock", { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })
})
