import { expect } from "chai"
import { escapeLike, getSearchTerms, matchesAllTerms } from "../../backend/routes/search"


describe("Search", () => {

    it ("getSearchTerms splits the query into lowercase words", () => {
        expect(getSearchTerms("Symptom  Histology ")).to.deep.equal(["symptom", "histology"])
        expect(getSearchTerms("   ")).to.deep.equal([])
    })

    it ("matchesAllTerms needs every word, in any order and any case", () => {
        expect(matchesAllTerms("Histology by Symptom", ["symptom", "histology"])).to.equal(true)
        expect(matchesAllTerms("Symptom count", ["symptom", "histology"])).to.equal(false)
        expect(matchesAllTerms("Anything", [])).to.equal(true)
    })

    it ("escapeLike escapes the LIKE wildcards", () => {
        expect(escapeLike("a%b_c\\d")).to.equal("a\\%b\\_c\\\\d")
    })
})
