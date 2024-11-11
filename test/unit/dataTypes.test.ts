import { expect } from "chai"
import { DATA_TYPES, NAMESPACE_PREFIX } from "../../backend/DataManager/dataTypes"


describe("Data Types", () => {

    it ("integer", () => {
        expect(DATA_TYPES.integer.set("2"   )).to.equal("2")
        expect(DATA_TYPES.integer.set("2g"  )).to.equal("2")
        expect(DATA_TYPES.integer.set("2.3g")).to.equal("2")
        expect(DATA_TYPES.integer.set(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")

        expect(DATA_TYPES.integer.get("2"   )).to.equal(2)
        expect(DATA_TYPES.integer.get("2g"  )).to.equal(2)
        expect(DATA_TYPES.integer.get("2.3g")).to.equal(2)
        expect(DATA_TYPES.integer.get(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")
    
        expect(() => DATA_TYPES.integer.set("a"        )).to.throw("Value a is not an integer")
        expect(() => DATA_TYPES.integer.set("Infinity" )).to.throw("Value Infinity is infinite")
        expect(() => DATA_TYPES.integer.set("-Infinity")).to.throw("Value -Infinity is infinite")
        expect(() => DATA_TYPES.integer.set(Number.MAX_SAFE_INTEGER + "5")).to.throw(`Value ${Number.MAX_SAFE_INTEGER}5 is greater then the MAX_SAFE_INTEGER`)
        expect(() => DATA_TYPES.integer.set(Number.MIN_SAFE_INTEGER + "5")).to.throw(`Value ${Number.MIN_SAFE_INTEGER}5 is smaller then the MIN_SAFE_INTEGER`)
    })

    it ("float", () => {
        expect(DATA_TYPES.float.set("2"   )).to.equal("2")
        expect(DATA_TYPES.float.set("2g"  )).to.equal("2")
        expect(DATA_TYPES.float.set("2.3g")).to.equal("2.3")
        expect(DATA_TYPES.float.set(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")

        expect(DATA_TYPES.float.get("2"   )).to.equal(2)
        expect(DATA_TYPES.float.get("2g"  )).to.equal(2)
        expect(DATA_TYPES.float.get("2.3g")).to.equal(2.3)
        expect(DATA_TYPES.float.get(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")

        expect(() => DATA_TYPES.float.set("a"        )).to.throw("Value a is not a number")
        expect(() => DATA_TYPES.float.set("Infinity" )).to.throw("Value Infinity is infinite")
        expect(() => DATA_TYPES.float.set("-Infinity")).to.throw("Value -Infinity is infinite")
        expect(() => DATA_TYPES.float.set(Number.MAX_VALUE + "5")).to.throw(`Value ${Number.MAX_VALUE}5 is infinite`)
        expect(() => DATA_TYPES.float.set("-" + Number.MAX_VALUE + "5")).to.throw(`Value -${Number.MAX_VALUE}5 is infinite`)
    })

    it ("boolean", () => {
        expect(DATA_TYPES.boolean.set("0"        )).to.equal("false")
        expect(DATA_TYPES.boolean.set("no"       )).to.equal("false")
        expect(DATA_TYPES.boolean.set("false"    )).to.equal("false")
        expect(DATA_TYPES.boolean.set("off"      )).to.equal("false")
        expect(DATA_TYPES.boolean.set("null"     )).to.equal("false")
        expect(DATA_TYPES.boolean.set("undefined")).to.equal("false")
        expect(DATA_TYPES.boolean.set("NaN"      )).to.equal("false")
        expect(DATA_TYPES.boolean.set("none"     )).to.equal("false")
        expect(DATA_TYPES.boolean.set(""         )).to.equal("false")
        expect(DATA_TYPES.boolean.set("1"        )).to.equal("true")
        expect(DATA_TYPES.boolean.set("true"     )).to.equal("true")
        expect(DATA_TYPES.boolean.set("yes"      )).to.equal("true")
        expect(DATA_TYPES.boolean.set(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")

        expect(DATA_TYPES.boolean.get("0"        )).to.equal(false)
        expect(DATA_TYPES.boolean.get("no"       )).to.equal(false)
        expect(DATA_TYPES.boolean.get("false"    )).to.equal(false)
        expect(DATA_TYPES.boolean.get("off"      )).to.equal(false)
        expect(DATA_TYPES.boolean.get("null"     )).to.equal(false)
        expect(DATA_TYPES.boolean.get("undefined")).to.equal(false)
        expect(DATA_TYPES.boolean.get("NaN"      )).to.equal(false)
        expect(DATA_TYPES.boolean.get("none"     )).to.equal(false)
        expect(DATA_TYPES.boolean.get(""         )).to.equal(false)
        expect(DATA_TYPES.boolean.get("1"        )).to.equal(true)
        expect(DATA_TYPES.boolean.get("true"     )).to.equal(true)
        expect(DATA_TYPES.boolean.get("yes"      )).to.equal(true)
        expect(DATA_TYPES.boolean.get(NAMESPACE_PREFIX + "x")).to.equal(NAMESPACE_PREFIX + "x")
    })

    it ("day", () => {
        expect(DATA_TYPES.day.set("2/3/2023"  )).to.equal("2023-02-03T00:00:00Z")
        expect(DATA_TYPES.day.set("02/3/2023" )).to.equal("2023-02-03T00:00:00Z")
        expect(DATA_TYPES.day.set("2/03/2023" )).to.equal("2023-02-03T00:00:00Z")
        expect(DATA_TYPES.day.set("02/03/2023")).to.equal("2023-02-03T00:00:00Z")
        expect(() => DATA_TYPES.day.set("x")).to.throw('Value "x" is not a valid date')

        expect(DATA_TYPES.day.get("2/3/2023"  )).to.equal("2023-02-03")
        expect(DATA_TYPES.day.get("02/3/2023" )).to.equal("2023-02-03")
        expect(DATA_TYPES.day.get("2/03/2023" )).to.equal("2023-02-03")
        expect(DATA_TYPES.day.get("02/03/2023")).to.equal("2023-02-03")
        expect(() => DATA_TYPES.day.get("x")).to.throw('Value "x" is not a valid date')
    })

    it ("week", () => {
        expect(DATA_TYPES.week.set("2/3/2023"  )).to.equal("2023-01-29T00:00:00Z")
        expect(DATA_TYPES.week.set("02/3/2023" )).to.equal("2023-01-29T00:00:00Z")
        expect(DATA_TYPES.week.set("2/03/2023" )).to.equal("2023-01-29T00:00:00Z")
        expect(DATA_TYPES.week.set("02/03/2023")).to.equal("2023-01-29T00:00:00Z")
        expect(() => DATA_TYPES.week.set("x")).to.throw('Value "x" is not a valid date')

        expect(DATA_TYPES.week.get("2/3/2023"  )).to.equal("2023-01-29")
        expect(DATA_TYPES.week.get("02/3/2023" )).to.equal("2023-01-29")
        expect(DATA_TYPES.week.get("2/03/2023" )).to.equal("2023-01-29")
        expect(DATA_TYPES.week.get("02/03/2023")).to.equal("2023-01-29")
        expect(() => DATA_TYPES.week.get("x")).to.throw('Value "x" is not a valid date')
    })

    it ("month", () => {
        expect(DATA_TYPES.month.set("2/3/2023"  )).to.equal("2023-02-01T00:00:00Z")
        expect(DATA_TYPES.month.set("02/3/2023" )).to.equal("2023-02-01T00:00:00Z")
        expect(DATA_TYPES.month.set("2/03/2023" )).to.equal("2023-02-01T00:00:00Z")
        expect(DATA_TYPES.month.set("02/03/2023")).to.equal("2023-02-01T00:00:00Z")
        expect(() => DATA_TYPES.month.set("x")).to.throw('Value "x" is not a valid date')

        expect(DATA_TYPES.month.get("2/3/2023"  )).to.equal("2023-02")
        expect(DATA_TYPES.month.get("02/3/2023" )).to.equal("2023-02")
        expect(DATA_TYPES.month.get("2/03/2023" )).to.equal("2023-02")
        expect(DATA_TYPES.month.get("02/03/2023")).to.equal("2023-02")
        expect(() => DATA_TYPES.month.get("x")).to.throw('Value "x" is not a valid date')
    })

    it ("year", () => {
        expect(DATA_TYPES.year.set("2/3/2023"  )).to.equal("2023-01-01T00:00:00Z")
        expect(DATA_TYPES.year.set("02/3/2023" )).to.equal("2023-01-01T00:00:00Z")
        expect(DATA_TYPES.year.set("2/03/2023" )).to.equal("2023-01-01T00:00:00Z")
        expect(DATA_TYPES.year.set("02/03/2023")).to.equal("2023-01-01T00:00:00Z")
        expect(() => DATA_TYPES.year.set("x")).to.throw('Value "x" is not a valid date')

        expect(DATA_TYPES.year.get("2/3/2023"  )).to.equal("2023")
        expect(DATA_TYPES.year.get("02/3/2023" )).to.equal("2023")
        expect(DATA_TYPES.year.get("2/03/2023" )).to.equal("2023")
        expect(DATA_TYPES.year.get("02/03/2023")).to.equal("2023")
        expect(() => DATA_TYPES.year.get("x")).to.throw('Value "x" is not a valid date')
    })
})