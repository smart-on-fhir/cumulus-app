import { getSuggestions } from "./lib"


const values = [
    { value: "KlonoPIN 0.5 MG", count: 10 },
    { value: "Aspirin 81 MG"  , count: 500 },
    { value: "aspirin 325 MG" , count: 20 },
    { value: "Baby Aspirin"   , count: 900 },
    { value: "Ibuprofen"      , count: 300 },
]

describe("getSuggestions", () => {
    it ("puts the values that start with the query first, then the ones that contain it", () => {
        expect(getSuggestions(values, "aspirin")).toEqual({
            items: [values[1], values[2], values[3]],
            prefixCount: 2
        })
    })

    it ("sorts alphabetically, ignoring case, with numbers in numeric order", () => {
        expect(getSuggestions(values, "a").items.map(v => v.value)).toEqual(["Aspirin 81 MG", "aspirin 325 MG", "Baby Aspirin"])
        expect(getSuggestions([{ value: "Dose 10", count: 1 }, { value: "Dose 9", count: 1 }], "dose").items.map(v => v.value)).toEqual(["Dose 9", "Dose 10"])
    })

    it ("ignores case", () => {
        expect(getSuggestions(values, "klonopin").items.map(v => v.value)).toEqual(["KlonoPIN 0.5 MG"])
    })

    it ("lists all values when nothing is typed", () => {
        expect(getSuggestions(values, "  ").items.map(v => v.value)).toEqual(["Aspirin 81 MG", "aspirin 325 MG", "Baby Aspirin", "Ibuprofen", "KlonoPIN 0.5 MG"])
    })
})
