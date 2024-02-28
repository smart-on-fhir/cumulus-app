import { expect } from "chai"
import { Op } from "sequelize"
import { getFindOptions, roundToPrecision, toTitleCase, uInt, valueToDataType, wait } from "../../backend/lib"


describe("Lib", () => {
    // describe("validateRequest", () => {
    //     it ("validateRequest", async () => {

    //     })
    // })

    describe("roundToPrecision", () => {

        it ("Returns NaN for NaN", () => {
            expect(roundToPrecision(NaN)).to.be.NaN
        })

        it ("Returns NaN for Infinity", () => {
            expect(roundToPrecision(Infinity)).to.be.NaN
            expect(roundToPrecision(-Infinity)).to.be.NaN
        })

        it ("Ignores invalid precision arguments", () => {
            // @ts-ignore
            expect(roundToPrecision(1.234, false)).to.equal(1)
            // @ts-ignore
            expect(roundToPrecision(1.234, Date)).to.equal(1)
            // @ts-ignore
            expect(roundToPrecision(1.234, Infinity)).to.equal(1)
            // @ts-ignore
            expect(roundToPrecision(1.234, -2)).to.equal(1)
        })

        it ("Respects valid precision arguments", () => {
            expect(roundToPrecision(1.5555, 0)).to.equal(2)
            expect(roundToPrecision(1.5555, 1)).to.equal(1.6)
            expect(roundToPrecision(1.5555, 2)).to.equal(1.56)
            expect(roundToPrecision(1.5555, 3)).to.equal(1.556)
            expect(roundToPrecision(1.5555, 4)).to.equal(1.5555)
            expect(roundToPrecision(1.5555, 5)).to.equal(1.5555)
        })
    })

    describe("valueToDataType", () => {

        const map = {
            ""                  : "",
            "0"                 : "integer",
            "-0"                : "integer",
            "+0"                : "integer",
            "123"               : "integer",
            "0.0"               : "float",
            "-0.0"              : "float",
            "+0.0"              : "float",
            "123.02"            : "float",
            "1234-01-01"        : "date:YYYY",
            "1234-01-01whatever": "date:YYYY",
            "1234-11-01"        : "date:YYYY-MM",
            "1234-11-01whatever": "date:YYYY-MM",
            "1234-11-11"        : "date:YYYY-MM-DD",
            "1234-11-11whatever": "date:YYYY-MM-DD",
            "whatever"          : "string"
        }

        for (const input in map) {
            const output = map[input as keyof typeof map];
            it (JSON.stringify(input) + " => " + JSON.stringify(output), () => {
                expect(valueToDataType(input), input + " should be " + output).to.equal(output)
            }) 
        }
    })

    describe("toTitleCase", () => {

        const map = {
            ""              : "",
            "this is a test": "This Is A Test",
            "this-is-a-test": "This Is A Test",
            "this_is_a_test": "This Is A Test",
            "this_IsA-test" : "This Is A Test",
        }

        for (const input in map) {
            const output = map[input as keyof typeof map];
            it (JSON.stringify(input) + " => " + JSON.stringify(output), () => {
                expect(toTitleCase(input), input + " should convert to " + output).to.equal(output)
            }) 
        }
    })

    describe("uInt", () => {

        const map = {
            ""    : 0,
            "1.5" : 1,
            "-1.5": 0,
            "+1.5": 1,
        }

        for (const input in map) {
            const output = map[input as keyof typeof map];
            it (JSON.stringify(input) + " => " + JSON.stringify(output), () => {
                expect(uInt(input), input + " should result in " + output).to.equal(output)
            }) 
        }
    })

    describe("wait", () => {
        it ("resolves after the specified delay", async () => {
            let start = Date.now()
            let end = start
            const job = wait(100).then(() => end = Date.now());
            expect(end).to.equal(start)
            await (job)
            expect(end - start).to.be.greaterThanOrEqual(99)
            expect(end - start).to.be.lessThan(120)
        })
    })

    describe("getFindOptions", () => {
        it ("where", () => {
            expect(
                getFindOptions({ query: { where: "a:5" }}).where
            ).to.deep.equal({a: 5})
            expect(
                getFindOptions({ query: { where: "a:5,b:6" }}).where
            ).to.deep.equal({ a: 5, b: 6 })
            expect(
                getFindOptions({ query: { where: "a:gt:5,b:6" }}).where
            ).to.deep.equal({ a: { [Op.gt]: 5 }, b: 6 })
            expect(
                getFindOptions({ query: { where: "a:5,b:x" }}).where
            ).to.deep.equal({ a: 5, b: "x" })
        })

        it("pick", () => {
            expect(
                getFindOptions({ query: { pick: "a,b,c" }}).attributes
            ).to.deep.equal({ include: ["a", "b", "c"] })
        })

        it("omit", () => {
            expect(
                getFindOptions({ query: { omit: "a,b,c" }}).attributes
            ).to.deep.equal({ include:[], exclude: ["a", "b", "c"] })
        })

        it ("order", () => {
            expect(
                getFindOptions({ query: { order: "a,b:desc,c:asc" }}).order
            ).to.deep.equal([["a"], ["b", "desc"], ["c", "asc"]])
        })

        it ("offset", () => {
            expect(getFindOptions({ query: { offset: 3 }}).offset).to.equal(3)
        })

        it ("include", () => {
            expect(getFindOptions({ query: { include: "t1:a1:c1|c2,t2:c3|c4" }}).include)
                .to.deep.equal([
                    { association: "t1", attributes: [ 'c1', 'c2' ], as: "a1" },
                    { association: "t2", attributes: [ 'c3', 'c4' ] }
                ])
        })

        it ("limit", () => {
            expect(getFindOptions({ query: { limit: "2" }}).limit).to.equal(2)
            expect(getFindOptions({ query: { limit: "-2" }}).limit).to.be.undefined

            const result = getFindOptions({ query: { limit: "2,c:4", include: "c" }})
            expect(result.limit).to.equal(2)
            expect(result.include).to.deep.equal([{ association: "c", separate: true, limit: 4 }])
        })
    })
})
