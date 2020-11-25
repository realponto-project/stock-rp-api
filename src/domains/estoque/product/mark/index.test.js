// const R = require('ramda')

const MarkDomain = require("./index")
const ProductDomain = require("../")

const markDomain = new MarkDomain()
const productDomain = new ProductDomain()


describe("markDomain", () => {
  let markMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    markMock = {
      mark: "HP",
      responsibleUser: "modrp"
    }
  })

  it("create", async () => {
    expect.hasAssertions()
    const markCreated = await markDomain.add(markMock)

    expect(markCreated.mark).toBe(markMock.mark)
    expect(markCreated.responsibleUser).toBe(markMock.responsibleUser)
  })


  it("getAll", async () => {
    expect.hasAssertions()
    const productMock = {
      category: "peca",
      SKU: "PC-00046",
      description: "",
      minimumStock: "2",
      mark: "HP",
      name: "GET",
      serial: true,
      responsibleUser: "modrp"
    }

    await productDomain.add(productMock)

    const cars = await markDomain.getAll()

    expect(cars.length > 0).toBe(true)
  })
})
