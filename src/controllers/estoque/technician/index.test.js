/* eslint-disable jest/no-hooks */
const request = require("../../../helpers/request")

describe("technicianController", () => {
  let headers = null

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

    const carMock = {
      model: "GOL",
      year: "2007",
      plate: "XYZ-9876"
    }

    await request().post("/api/car", carMock, { headers })
  })

  it("create", async () => {
    expect.hasAssertions()
    const technicianMock = {
      name: "MATHEUS CABEÇA DE FILTRO",
      CNH: "01/01/2000",
      plate: "XYZ-9876",
      external: false
    }

    const response = await request().post("/api/technician", technicianMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.name).toBe(technicianMock.name)
    expect(body.CNH).toBe(technicianMock.CNH.replace(/\D/gi, ""))
    expect(body.cars[0].plate).toBe(technicianMock.plate)
  })

  it("getall, query", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/technician", { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBeTruthy()
  })
})
