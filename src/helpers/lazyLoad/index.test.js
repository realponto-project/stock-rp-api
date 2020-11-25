require("./fakeDatabase")
const Sequelize = require("sequelize")
const moment = require("moment")

const { MaliciousError } = require("../errors")

const { Op: operators } = Sequelize

const formatQuery = require("./")

describe("test about lazyLoad, total and pages", () => {
  it("total and page case 1", () => {
    expect.hasAssertions()
    const query = {
      page: 2,
      total: 20
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(20)
    expect(offset).toBe(20)
  })

  it("total and page case 2", () => {
    expect.hasAssertions()
    const query = {
      page: 3,
      total: 150
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(100)
    expect(offset).toBe(200)
  })

  it("total and page case 3", () => {
    expect.hasAssertions()
    const query = {
      page: 3,
      total: -150
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(50)
  })

  it("total and page case 4", () => {
    expect.hasAssertions()
    const query = {
      page: 0,
      total: 0
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("total and page case 5", () => {
    expect.hasAssertions()
    const query = {
      page: -5,
      total: -150
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("total miss", () => {
    expect.hasAssertions()
    const query = { page: -5 }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("page miss", () => {
    expect.hasAssertions()
    const query = { total: 0 }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})


describe("test about lazyLoad, global search", () => {
  it("fields in global", () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          global: {
            fields: [
              "name",
              "motherName",
              "fatherName"
            ],
            value: "string"
          }
        }
      }
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      [operators.or]: [
        { name: { [operators.iRegexp]: "string" } },
        { motherName: { [operators.iRegexp]: "string" } },
        { fatherName: { [operators.iRegexp]: "string" } }
      ]
    }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})

describe("test about lazyLoad, specific search", () => {
  it("fields in specific with string", () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          specific: {
            name: "maria",
            motherName: "abrey"
          }
        }
      }
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      name: { [operators.iRegexp]: "maria" },
      motherName: { [operators.iRegexp]: "abrey" }
    }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("fields in specific with date", () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          specific: {
            name: "Vitor",
            birthday: {
              start: new Date("05-29-1944"),
              end: new Date("02-28-1989")
            }
          }
        }
      }
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      name: { [operators.iRegexp]: "Vitor" },
      birthday: {
        [operators.gte]: moment("05-29-1944", "MM-DD-YYYY").startOf("day").toString(),
        [operators.lte]: moment("02-28-1989", "MM-DD-YYYY").endOf("day").toString()
      }
    }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})

describe("test about empty query", () => {
  it("pass empty query, should be returned default lazyload and no search filters", () => {
    expect.hasAssertions()
    const { getWhere, limit, offset } = formatQuery()

    const expectedWhere = { }
    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("pass null query, should be returned default lazyload and no search filters", () => {
    expect.hasAssertions()
    const { getWhere, limit, offset } = formatQuery(null)

    const expectedWhere = { }
    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("pass emmpyObject query, should be returned default lazyload and no search filters", () => {
    expect.hasAssertions()
    const { getWhere, limit, offset } = formatQuery({})

    const expectedWhere = { }
    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("pass emmpyArray query, should be returned default lazyload and no search filters", () => {
    expect.hasAssertions()
    const { getWhere, limit, offset } = formatQuery([])

    const expectedWhere = { }
    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("pass undefined query, should be returned default lazyload and no search filters", () => {
    expect.hasAssertions()
    const { getWhere, limit, offset } = formatQuery(undefined)

    const expectedWhere = { }
    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})


describe("test about lazyLoad, errors", () => {
  it("malicius search in specific", () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          specific: {
            password: "maria",
            motherName: "abrey"
          }
        }
      }
    }
    const { getWhere } = formatQuery(query)

    const testFormatter = () => getWhere("table1")
    expect(testFormatter).toThrow(new MaliciousError())
  })

  it("malicius search in global", () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          global: {
            fields: [
              "name",
              "motherName",
              "password"
            ],
            value: "string"
          }
        }
      }
    }
    const { getWhere } = formatQuery(query)

    const testFormatter = () => getWhere("table1")
    expect(testFormatter).toThrow(new MaliciousError())
  })

  it("fields global in that are not part of the table", async () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          global: {
            fields: [
              "name1",
              "motherName2",
              "fatherName3"
            ],
            value: "string"
          }
        }
      }
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  it("fields especific in that are not part of the table", async () => {
    expect.hasAssertions()
    const query = {
      filters: {
        table1: {
          specific: {
            motherName2: "maria",
            fatherName3: "abrey"
          }
        }
      }
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere("table1")

    expect(where).toStrictEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})
