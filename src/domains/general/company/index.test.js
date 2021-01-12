// const R = require('ramda')

const CompanyDomain = require(".")

const { FieldValidationError } = require("../../../helpers/errors")

const companyDomain = new CompanyDomain()

describe("companyDomain", () => {
  let companyMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(() => {
    companyMock = {
      razaoSocial: "teste 123 LTDA",
      cnpj: "40190041000102",
      street: "jadaisom rodrigues",
      number: "6969",
      city: "São Paulo",
      state: "UF",
      neighborhood: "JD. Avelino",
      zipCode: "09930-210",
      telphone: "(11)0965-4568",
      nameContact: "joseildom",
      email: "josealdo@gmasi.com",
      responsibleUser: "modrp",
      relation: "cliente"
    }
  })

  it("create company client", async () => {
    expect.hasAssertions()
    const companyCreated = await companyDomain.add(companyMock)

    expect(companyCreated.razaoSocial).toBe(companyMock.razaoSocial)
    expect(companyCreated.cnpj).toBe(companyMock.cnpj)
    expect(companyCreated.street).toBe(companyMock.street)
    expect(companyCreated.number).toBe(companyMock.number)
    expect(companyCreated.city).toBe(companyMock.city)
    expect(companyCreated.state).toBe(companyMock.state)
    expect(companyCreated.neighborhood).toBe(companyMock.neighborhood)
    expect(companyCreated.zipCode).toBe("09930210")
    expect(companyCreated.telphone).toBe("1109654568")
    expect(companyCreated.nameContact).toBe(companyMock.nameContact)
    expect(companyCreated.email).toBe(companyMock.email)
    expect(companyCreated.relation).toBe(companyMock.relation)

    await expect(companyDomain.add(companyMock))
      .rejects.toThrow(new FieldValidationError())
  })

  it("create company provider", async () => {
    expect.hasAssertions()
    const company = {
      razaoSocial: "fornecesor 123 LTDA",
      cnpj: "51136141000177",
      street: "jadaisom rodrigues",
      number: "6969",
      city: "São Paulo",
      state: "UF",
      neighborhood: "JD. Avelino",
      zipCode: "09930-210",
      telphone: "(11)0965-4568",
      nameContact: "joseildom",
      email: "fornecedor@gmail.com",
      responsibleUser: "modrp",
      relation: "fornecedor"
    }
    const companyCreated = await companyDomain.add(company)

    expect(companyCreated.razaoSocial).toBe(company.razaoSocial)
    expect(companyCreated.cnpj).toBe(company.cnpj)
    expect(companyCreated.street).toBe(company.street)
    expect(companyCreated.number).toBe(company.number)
    expect(companyCreated.city).toBe(company.city)
    expect(companyCreated.state).toBe(company.state)
    expect(companyCreated.neighborhood).toBe(company.neighborhood)
    expect(companyCreated.zipCode).toBe("09930210")
    expect(companyCreated.telphone).toBe("1109654568")
    expect(companyCreated.nameContact).toBe(company.nameContact)
    expect(companyCreated.email).toBe(company.email)
    expect(companyCreated.relation).toBe(company.relation)

    await expect(companyDomain.add(company))
      .rejects.toThrow(new FieldValidationError())
  })

  it("getAllFornecedor", async () => {
    expect.hasAssertions()
    const fornecedores = await companyDomain.getAllFornecedor()

    expect(fornecedores.length > 0).toBeTruthy()
  })
})
