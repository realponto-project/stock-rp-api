const StatusExpeditionDomain = require(".")

const statusExpeditionDomain = new StatusExpeditionDomain()

describe("reserveOsDomain", () => {
  it("create statusExpedition", async () => {
    expect.hasAssertions()
    const statusExpeditionMock = { status: "CONSERTO" }
    const statusExpeditionCreated = await statusExpeditionDomain.add(
      statusExpeditionMock
    )

    expect(statusExpeditionCreated.status).toBe(statusExpeditionCreated.status)
  })
})
