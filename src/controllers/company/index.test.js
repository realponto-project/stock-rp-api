const request = require("../../helpers/request")

describe("companyController", () => {
  let companyMock = null
  let headers = null
  let params = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    companyMock = {
      razaoSocial: "teste 12sa3 LTDA",
      cnpj: "32478461000160",
      street: "jadaisom rodrigues",
      number: "6969",
      city: "São Paulo",
      state: "UF",
      neighborhood: "JD. Avelino",
      zipCode: "09930210",
      telphone: "09654568",
      nameContact: "joseildom",
      email: "clebinho@joazinho.com",
      responsibleUser: "modrp",
      relation: "fornecedor"
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

    params = {
      query: {
        filters: {
          company: {
            global: {
              fields: [
                "cnpj",
                "razaoSocial",
                "nameContact",
                "telphone"
              ],
              value: ""
            },
            specific: {
              cnpj: "",
              razaoSocial: "",
              nameContact: "",
              telphone: "",
              relation: "fornecedor"
            }
          }
        },
        page: 1,
        total: 25,
        order: {
          field: "createdAt",
          acendent: true
        }
      }
    }
  })
  it("true", () => {
    expect.hasAssertions()
    expect(true).toBe(true)
  })

  it("create", async () => {
    expect.hasAssertions()
    const response = await request().post("/api/company", companyMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(companyMock.razaoSocial)
    expect(body.cnpj).toBe(companyMock.cnpj)
    expect(body.street).toBe(companyMock.street)
    expect(body.number).toBe(companyMock.number)
    expect(body.city).toBe(companyMock.city)
    expect(body.state).toBe(companyMock.state)
    expect(body.neighborhood).toBe(companyMock.neighborhood)
    expect(body.zipCode).toBe(companyMock.zipCode)
    expect(body.telphone).toBe(companyMock.telphone)
  })

  it("getall, query", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/company", { headers, params })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })

  it("getallFornecedor", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/company/getallFornecedor", { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBeTruthy()
  })
})
