const TechnicianDomain = require(".")
const CarDomain = require("./car")

const { FieldValidationError } = require("../../../helpers/errors")

const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()

describe("technicianDomain", () => {
  let technicianMock = null

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    const carMock = {
      model: "GOL",
      year: "2007",
      plate: "ABC-4321"
    }

    await carDomain.add(carMock)

    technicianMock = {
      name: "CARLOS",
      CNH: "01/01/2000",
      plate: "ABC-4321",
      external: false
    }
  })

  it("create car", async () => {
    expect.hasAssertions()
    const technicianCreated = await technicianDomain.add(technicianMock)

    expect(technicianCreated.name).toBe(technicianMock.name)
    expect(technicianCreated.CNH).toBe(technicianMock.CNH.replace(/\D/gi, ""))
    expect(technicianCreated.cars[0].plate).toBe(technicianMock.plate)

    await expect(technicianDomain.add(technicianMock))
      .rejects.toThrow(new FieldValidationError())
  })

  it("getAll", async () => {
    expect.hasAssertions()
    const technical = await technicianDomain.getAll()

    expect(technical.length > 0).toBeTruthy()
  })
})
