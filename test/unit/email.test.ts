import { expect }                  from "chai"
import { renderToStaticMarkup }    from "react-dom/server"
import { appUrl }                  from "../../backend/lib"
import { DataRequestNotification } from "../../backend/services/email/components"


describe("Emails", () => {

    describe("appUrl", () => {

        const prefix = process.env.VITE_APP_PREFIX

        afterEach(() => {
            if (prefix === undefined) {
                delete process.env.VITE_APP_PREFIX
            } else {
                process.env.VITE_APP_PREFIX = prefix
            }
        })

        it ("works without a prefix", () => {
            delete process.env.VITE_APP_PREFIX
            expect(appUrl("requests/3", "https://host.org").href).to.equal("https://host.org/requests/3")
        })

        it ("adds the prefix, with or without slashes", () => {
            for (const p of ["network", "/network", "network/", "/network/"]) {
                process.env.VITE_APP_PREFIX = p
                expect(appUrl("requests/3", "https://host.org").href).to.equal("https://host.org/network/requests/3")
            }
        })
    })

    describe("DataRequestNotification", () => {

        it ("shows the Data Slice and links to it", () => {
            const html = renderToStaticMarkup(DataRequestNotification({
                subscription: {
                    name       : "PCX full OS v6",
                    description: "Overall survival",
                    dataURL    : "https://example.com/data.csv",
                    createdAt  : "2026-10-28T14:05:00Z"
                },
                url      : "https://host.org/network/requests/3",
                createdBy: "user@example.com",
                groupName: "Oncology"
            }))
            expect(html).to.include("New Data Slice")
            expect(html).to.include('<a href="https://host.org/network/requests/3" target="_blank">PCX full OS v6</a>')
            expect(html).to.include("Overall survival")
            expect(html).to.include("user@example.com")
            expect(html).to.include("2026-10-28 14:05 UTC")
            expect(html).to.include("Oncology")
            expect(html).to.include("https://example.com/data.csv")
        })

        it ("leaves out what the Data Slice doesn't have", () => {
            const html = renderToStaticMarkup(DataRequestNotification({
                subscription: { name: "Slice" },
                url: "https://host.org/requests/3"
            }))
            expect(html).to.include("Unknown user")
            expect(html).to.include("<b>Slice Group: </b>None")
            expect(html).not.to.include("Data URL")
        })
    })
})
