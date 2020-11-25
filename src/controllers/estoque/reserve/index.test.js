const request = require("../../../helpers/request")

const database = require("../../../database")

const Kit = database.model("kit")
const KitParts = database.model("kitParts")
const ProductBase = database.model("productBase")
const StockBase = database.model("stockBase")

describe("reserveController", () => {
  let headers = null
  let product = null
  let technician = null
  let productBase = null
  let reserveOs = null

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

    const mark = {
      mark: "MI",
      responsibleUser: "modrp"
    }

    await request().post("/api/mark", mark, { headers })

    const productMock = {
      category: "peca",
      SKU: "PC-00048",
      description: "",
      minimumStock: "12",
      mark: "MI",
      name: "BLOCO",
      serial: false,
      responsibleUser: "modrp"
    }

    product = await request().post("/api/product", productMock, { headers })

    const companyMock = {
      razaoSocial: "teste reserva contoller LTDA",
      cnpj: "92735515000158",
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

    const company = await request().post("/api/company", companyMock, { headers })

    const entranceMock = {
      amountAdded: "50",
      stockBase: "ESTOQUE",
      productId: product.body.id,
      companyId: company.body.id,
      responsibleUser: "modrp"
    }

    await request().post("/api/entrance", entranceMock, { headers })

    const carMock = {
      model: "GOL",
      year: "2007",
      plate: "XYZ-1998"
    }

    await request().post("/api/car", carMock, { headers })

    const technicianMock = {
      name: "EU MESMO",
      CNH: "01/01/2000",
      plate: "XYZ-1998",
      external: true
    }

    technician = await request().post("/api/technician", technicianMock, { headers })

    productBase = await ProductBase.findOne({
      where: { productId: product.body.id },
      include: [{ model: StockBase, where: { stockBase: "ESTOQUE" } }],
      transacition: null
    })

    const reserveOsMock = {
      razaoSocial: "test Company",
      cnpj: "47629199000185",
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: "1",
          status: "venda"
        }
      ]
    }

    reserveOs = await request().post("/api/reserve/OS", reserveOsMock, { headers })
  })

  it("create reserva Os", async () => {
    expect.hasAssertions()
    const reserveMock = {
      razaoSocial: "test Company",
      cnpj: "47629199000185",
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: "5",
          status: "venda"
        }
      ]
    }

    const response = await request().post("/api/reserve/OS", reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
    expect(body.technician.name).toBe(technician.body.name)
    expect(body.technician.CNH).toBe(technician.body.CNH)
  })

  it("output", async () => {
    expect.hasAssertions()
    const reserveMock = {
      os: "64636556",
      razaoSocial: "test Company",
      cnpj: "47629199000185",
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: "6",
          status: "venda"
        }
      ]
    }

    const reserveCreated = await request().post(
      "/api/reserve/OS",
      reserveMock,
      { headers }
    )

    const outputmock = {
      osPartsId: reserveCreated.body.productBases[0].osParts.id,
      add: { output: "2" }
    }

    const response = await request().put("/api/reserve/output", outputmock, { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  it("create delete Os", async () => {
    expect.hasAssertions()
    const reserveMock = {
      os: "366484",
      razaoSocial: "test Company",
      cnpj: "47629199000185",
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: "9",
          status: "venda"
        }
      ]
    }

    const Os = await request().post("/api/reserve/OS", reserveMock, { headers })

    const response = await request().delete("/api/reserve/OS", {
      params: { osId: Os.body.id },
      headers
    })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBe("sucesso")
  })

  it("getallOs", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/reserve/Os", { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })

  it("getAllKit", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/reserve/Kit", { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  it("getOsByOs", async () => {
    expect.hasAssertions()
    const reserveMock = {
      razaoSocial: "test Company",
      cnpj: "47629199000185",
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: "3",
          status: "venda"
        }
      ]
    }

    await request().post("/api/reserve/OS", reserveMock, { headers })

    const response = await request().get("/api/reserve/getOsByOs", {
      headers,
      params: { os: reserveMock.razaoSocial }
    })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
  })

  it("create reserva kit", async () => {
    expect.hasAssertions()
    const reserveMock = {
      kitParts: [
        {
          productBaseId: productBase.id,
          amount: "2"
        }
      ]
    }

    const response = await request().post("/api/reserve/kit", reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })

  it("getKitDefaultValue", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/reserve/kitDefaultValue", { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  it("create reserva kitOut", async () => {
    expect.hasAssertions()
    const kitParts = await KitParts.findOne({
      include: [
        {
          model: Kit,
          where: { technicianId: technician.body.id }
        }
      ],
      transacition: null
    })

    const reserveMock = {
      reposicao: "3",
      expedicao: "2",
      perda: "1",
      os: reserveOs.body.os,
      kitPartId: kitParts.id
    }

    const response = await request().post("/api/reserve/kitOut", reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBeTruthy()
  })

  it("getAllKitOut", async () => {
    expect.hasAssertions()
    const response = await request().get("/api/reserve/kitOut", { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  it("create reserva mercado livre", async () => {
    expect.hasAssertions()
    const reserveMock = {
      trackingCode: "AA123456789BR",
      name: "TEST",
      cnpjOrCpf: "46700988888",
      freeMarketParts: [
        {
          productBaseId: productBase.id,
          amount: "1"
        }
      ]
    }

    const response = await request().post(
      "/api/reserve/freeMarket",
      reserveMock,
      { headers }
    )

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.trackingCode).toBe(reserveMock.trackingCode)
    expect(body.zipCode).toBe(reserveMock.zipCode)
  })
})
