import aggregator, { DataPackage } from "../Aggregator"

vi.mock("../backend", () => ({
    request: async () => ({
        response: new Response(),
        body: {
            core: {
                "004": {
                    study_prefix: "core",
                    description : "Old core",
                    tables: {
                        core__count_old: { description: "Old table", columns: {} }
                    }
                },
                "005": {
                    study_prefix: "core",
                    description : " Core \n",
                    tables: {
                        core__count_x  : { description: "Count X"  , columns: {} },
                        core__summary  : { description: "Summary"  , columns: {} },
                        core__undefined: { columns: {} }
                    }
                }
            },
            kaplan: {
                "007": { study_prefix: "kaplan", tables: {} }
            }
        }
    })
}))

function pkg(props: Partial<DataPackage>) {
    return { study: "core", version: "005", columns: {}, ...props } as DataPackage
}

describe("Aggregator", () => {

    describe("getStudyDescription", () => {
        it ("uses the description of that version", async () => {
            expect(await aggregator.getStudyDescription("core", "004")).toBe("Old core")
        })

        it ("uses the newest description for versions without one", async () => {
            expect(await aggregator.getStudyDescription("core", "003")).toBe("Core")
            expect(await aggregator.getStudyDescription("core")).toBe("Core")
        })

        it ("resolves with undefined for studies without a description", async () => {
            expect(await aggregator.getStudyDescription("kaplan")).toBeUndefined()
            expect(await aggregator.getStudyDescription("missing")).toBeUndefined()
        })
    })

    describe("getPackageDescription", () => {
        it ("uses the study table with the package name", async () => {
            expect(await aggregator.getPackageDescription(pkg({ name: "count_x" }))).toBe("Count X")
        })

        it ("uses the newest version that has the table", async () => {
            expect(await aggregator.getPackageDescription(pkg({ name: "count_x", version: "003" }))).toBe("Count X")
            expect(await aggregator.getPackageDescription(pkg({ name: "count_old" }))).toBe("Old table")
        })

        it ("strips the site from the names of flat packages", async () => {
            expect(await aggregator.getPackageDescription(pkg({ name: "summary__bch", site: "bch", type: "flat" }))).toBe("Summary")
        })

        it ("strips the site only from flat packages", async () => {
            expect(await aggregator.getPackageDescription(pkg({ name: "summary__bch", site: "bch", type: "cube" }))).toBeUndefined()
        })

        it ("resolves with undefined for packages without a description", async () => {
            expect(await aggregator.getPackageDescription(pkg({ name: "undefined" }))).toBeUndefined()
            expect(await aggregator.getPackageDescription(pkg({ name: "missing" }))).toBeUndefined()
            expect(await aggregator.getPackageDescription(pkg({ name: "x", study: "kaplan" }))).toBeUndefined()
        })
    })
})
