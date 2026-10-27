import { expect } from "chai"
import Views      from "../../fixtures/Views"
import Tags       from "../../fixtures/Tags"
import {
    server,
    resetTable,
    admin
} from "../../test-lib"


describe("Search (GET /api/search)", () => {

    beforeEach(async () => {
        await resetTable("View", Views)
        await resetTable("Tag", Tags)
    })

    async function search(q: string) {
        const res = await fetch(`${server.baseUrl}/api/search?q=${encodeURIComponent(q)}`, { headers: { Cookie: "sid=" + admin.sid }})
        expect(res.status).to.equal(200)
        const json = await res.json()
        return json.results.map((r: any) => r.name).sort()
    }

    it ("matches names that contain every word, in any order", async () => {
        const expected = ["Graph owned by User#3", "Graph shared with User#3"]
        expect(await search("graph user")).to.deep.equal(expected)
        expect(await search("user graph")).to.deep.equal(expected)
        expect(await search("  USER   Graph ")).to.deep.equal(expected)
    })

    it ("needs all the words to match", async () => {
        expect(await search("graph timeline")).to.deep.equal(["Demo - Timeline Graph"])
        expect(await search("graph tag")).to.deep.equal([])
    })

    it ("treats LIKE wildcards literally", async () => {
        expect(await search("%")).to.deep.equal([])
        expect(await search("_")).to.deep.equal([])
    })

    it ("returns everything for an empty query", async () => {
        expect(await search("")).to.include.members([...Views, ...Tags].map(r => r.name))
    })
})
