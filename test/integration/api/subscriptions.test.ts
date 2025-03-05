import { expect, use }           from "chai"
import chaiAsPromised            from "chai-as-promised"
import { Sequelize, QueryTypes } from "sequelize"
import setupDB                   from "../../../backend/db"
import Subscription              from "../../../backend/db/models/Subscription"
import config                    from "../../../backend/config"
import Subscriptions             from "../../fixtures/Subscriptions"
import Tags                      from "../../fixtures/Tags"
import {
    getCookie,
    resetTable,
    getPermissionsForRole,
    server,
    testEndpoint
} from "../../test-lib"
import MockServer from "../../MockServer"
import SystemUser from "../../../backend/SystemUser"



use(chaiAsPromised);


describe("Subscriptions", () => {

    let dbConnection: Sequelize;
    
    beforeEach(async () => {
        await resetTable("Tag", Tags)
        await resetTable("Subscription", Subscriptions)

        dbConnection = await setupDB(config);

        await dbConnection.query(`DROP table if exists "subscription_data_1"`)
        await dbConnection.query(
            `CREATE table "subscription_data_1" (
                "cnt" Integer,
                "gender" Text,
                "_float" Float,
                "_boolean" Boolean
            )`
        )
        await dbConnection.query(
            `INSERT INTO "subscription_data_1" ("gender", "cnt", "_float", "_boolean") VALUES
            ('M', 100, 1.2, true), ('F', 200, 3.4, false), (NULL, 300, 5.0, true)`
        )
    })

    describe("list", () => {
        testEndpoint("Subscriptions.read", "GET", "/api/requests")
    })

    describe("view", () => {
        testEndpoint("Subscriptions.read", "GET", "/api/requests/1?group=true&tags=true&graphs=true&study_areas=true")
    })

    describe("create", () => {
        testEndpoint(
            "Subscriptions.create",
            "POST",
            "/api/requests",
            {
                name: "Record name",
                description: "Record description",
                Tags: [{ id: 1 }]
            }
        )
    })

    describe("update", () => {
        testEndpoint(
            "Subscriptions.update",
            "PUT",
            "/api/requests/1",
            {
                name: "Record name 2",
                description: "Record description 2",
                Tags: [{ id: 1 }]
            }
        )

        it ("produces the expected error message on failure", async () => {
            const res = await fetch(`${server.baseUrl}/api/requests/1`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                    cookie: getCookie("admin")
                },
                body: JSON.stringify({ name: null })
            });
            const text = await res.text()
            expect(text).to.match(/Updating subscription failed/)
        })
    })

    describe("delete", () => {
        testEndpoint("Subscriptions.delete", "DELETE", "/api/requests/1")
    })

    describe("by-group", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.read")) {
                it (`${role} can read subscriptions by group`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/by-group?requestLimit=2`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot read subscriptions by group`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/by-group`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })

    describe("get subscription graphs", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.read") && permissions.includes("Graphs.read")) {
                it (`${role} can read subscription graphs`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/views`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot read subscription graphs`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/views`, options)
                    expect(res.status).to.equal(200)
                    expect(await res.json()).to.deep.equal([])
                })
            }
        })
    })

    describe("export subscription data", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.export")) {
                it (`${role} can export subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/data?inline=true`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot export subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/data?inline=true`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })

    describe("raw-data", () => {
        testEndpoint("Subscriptions.read", "GET", "/api/requests/1/raw-data")
    })

    // describe("refresh subscription data", () => {

    //     const mockServer = new MockServer("CSV Server", true)

    //     before(() => mockServer.start())
    //     after(() => mockServer.stop())
    //     afterEach(() => mockServer.clear())

    //     it ("guest cannot refresh subscription data", async () => {
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`)
    //         expect(res.status).to.equal(401)
    //     })

    //     it ("Rejects subscriptions without dataUrl", async () => {
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(res.status).to.equal(400)
    //         expect(await res.text()).to.equal("Cannot fetch data for subscription having no dataURL")
    //     })

    //     it ("Passes error status codes down to the client", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", { status: 404 })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(res.status).to.equal(400)
    //         expect(await res.text()).to.equal("Unexpected response code 404. Expecting 200.")
    //     })

    //     it ("requires x-column-names header to have valid item length", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type": "text/csv",
    //                 "x-column-names": "a,b,c"
    //             },
    //             body: "cnt,a,b,c\n"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal("The file contains 4 columns but names for 3 columns were provided")
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("requires x-column-types header to have valid item length", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type": "text/csv",
    //                 "x-column-types": "integer,float,boolean"
    //             },
    //             body: "cnt,a,b,c\n"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal("The file contains 4 columns but data types for 3 columns were provided")
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("requires x-column-descriptions header to have valid item length", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type": "text/csv",
    //                 "x-column-descriptions": "x,y,z"
    //             },
    //             body: "cnt,a,b,c\n"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         // console.log(await res.text())
    //         expect(await res.text()).to.equal("The file contains 4 columns but descriptions for 3 columns were provided")
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("Catches missing total row", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type"         : "text/csv",
    //                 "x-column-names"       : "cnt    , a     , b   , c",
    //                 "x-column-types"       : "integer, string, date, boolean",
    //                 "x-column-descriptions": "cnt    , a     , b   , c"
    //             },
    //             body: "cnt, a, b, c\n"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal(`Unable to find a total row where all data columns are NULL`)
    //         expect(res.status).to.equal(400)
    //     })
        
    //     it ("Catches rows with extra columns", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type"         : "text/csv",
    //                 "x-column-names"       : "cnt    , a     , b   , c",
    //                 "x-column-types"       : "integer, string, float, boolean",
    //                 "x-column-descriptions": "cnt    , a     , b   , c"
    //             },
    //             body: "cnt,a,b,c\n1,2,3,4\n1,2,3,4,5\n1,2,3,4"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal(`Number of cells exceeds the number of columns`)
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("Catches invalid data types", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type"         : "text/csv",
    //                 "x-column-names"       : "cnt    , a     , b   , c",
    //                 "x-column-types"       : "integer, string, badColumn, boolean",
    //                 "x-column-descriptions": "cnt    , a     , b   , c"
    //             },
    //             body: "cnt,a,b,c\n1,2,3,4\n1,2,3,4\n1,2,3,4"
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal(`Invalid data type "badColumn" at column 3`)
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("Catches parse errors", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type"         : "text/csv",
    //                 "x-column-names"       : "cnt    , a     , b   , c",
    //                 "x-column-types"       : "integer, string, badColumn, boolean",
    //                 "x-column-descriptions": "cnt    , a     , b   , c"
    //             },
    //             body: 'cnt,a,b,c\n1,2,3,4\n1,2,"3,4\n1,2,3,4'
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         expect(await res.text()).to.equal(`Syntax error - unterminated string. Expecting "\\"", line: 1,2,"3,4`)
    //         expect(res.status).to.equal(400)
    //     })

    //     it ("redirects", async () => {
    //         await Subscription.update({ dataURL: `${mockServer.baseUrl}/csv1` }, { where: { id: 1 }, user: SystemUser })
    //         mockServer.mock("/csv1", {
    //             status: 302,
    //             headers: {
    //                 "x-column-descriptions": "cnt-desc, a-desc, b-desc, c-desc",
    //                 "x-column-types"       : "integer, string, float, float",
    //                 location: "/csv2"
    //             }
    //         })
    //         mockServer.mock("/csv2", {
    //             headers: {
    //                 "content-type"         : "text/csv",
    //                 "x-column-names"       : "cnt    , a     , b    , c",
    //                 "x-column-types"       : "integer, string, float, boolean",
    //                 // "x-column-descriptions": "cnt    , a     , b   , c"
    //             },
    //             body: 'cnt,a,b,c\n1,2,3,4\n5,6,7,8\n9,,,'
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, { headers: { cookie: getCookie("manager") }})
    //         const json = await res.json()
    //         expect(json.metadata).to.deep.equal({
    //             cols: [
    //                 { name: 'cnt', label: 'cnt', dataType: 'integer', description: 'cnt-desc' },
    //                 { name: 'a'  , label: 'a'  , dataType: 'string' , description: 'a-desc'   },
    //                 { name: 'b'  , label: 'b'  , dataType: 'float'  , description: 'b-desc'   },
    //                 { name: 'c'  , label: 'c'  , dataType: 'boolean', description: 'c-desc'   }
    //             ],
    //             total: 9
    //         })
    //     })

    //     it ("ignores empty x-column-names headers", async () => {
    //         const model = (await Subscription.findByPk(1, { user: SystemUser }))!
    //         await model.update({ dataURL: `${mockServer.baseUrl}/csv` }, { user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type"  : "text/csv",
    //                 "x-column-names": "",
    //                 "x-column-types": "integer, string, string, string",
    //             },
    //             body: [
    //                 "cnt,a,b,c",
    //                 '20,,,',
    //                 '10,x,,""',
    //                 "12,,y,",
    //                 "2,,,z"
    //             ].join("\n")
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, {
    //             headers: {
    //                 cookie: getCookie("manager")
    //             }
    //         })
    //         await model.reload({ user: SystemUser })

    //         // console.log(await res.text())
    //         expect(res.status).to.equal(200)
    //         expect(model.metadata).to.deep.equal({
    //             cols: [
    //                 { name: "cnt", label: "Count", dataType: "integer", description: "Count" },
    //                 { name: "a"  , label: "A"    , dataType: "string" , description: "" },
    //                 { name: "b"  , label: "B"    , dataType: "string" , description: "" },
    //                 { name: "c"  , label: "C"    , dataType: "string" , description: "" }
    //             ],
    //             total: 20
    //         })
    //     })

    //     it ("Works as expected", async () => {
    //         const model = (await Subscription.findByPk(1, { user: SystemUser }))!
    //         await model.update({ dataURL: `${mockServer.baseUrl}/csv` }, { user: SystemUser })
    //         mockServer.mock("/csv", {
    //             headers: {
    //                 "content-type": "text/csv"
    //             },
    //             body: [
    //                 "cnt,a,b,c",
    //                 '20,,,',
    //                 '10,x,,""',
    //                 "12,,y,",
    //                 "2,,,z"
    //             ].join("\n")
    //         })
    //         const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, {
    //             headers: {
    //                 cookie: getCookie("manager")
    //             }
    //         })
    //         await model.reload({ user: SystemUser })

    //         // console.log(await res.text())
    //         expect(res.status).to.equal(200)
    //         expect(model.metadata).to.deep.equal({
    //             cols: [
    //                 { name: "cnt", label: "Count", dataType: "integer", description: "Count" },
    //                 { name: "a"  , label: "A"    , dataType: "string" , description: "" },
    //                 { name: "b"  , label: "B"    , dataType: "string" , description: "" },
    //                 { name: "c"  , label: "C"    , dataType: "string" , description: "" }
    //             ],
    //             total: 20
    //         })
    //     })
    // })

    describe("import subscription data", () => {

        async function upload({
            types,
            labels,
            descriptions,
            body
        }: {
            types : string
            labels: string
            descriptions: string
            body: string
        }) {
            const url = new URL("/api/requests/1/data", server.baseUrl)
            url.searchParams.set("types" , types )
            url.searchParams.set("labels", labels)
            url.searchParams.set("descriptions", descriptions)
            const cookie = getCookie("admin")
            const res = await fetch(url, {
                method: "PUT",
                headers: { "content-type": "text/plain;charset=UTF-8", cookie },
                body
            });

            if (res.status !== 200) {
                const msg = await res.text()
                throw new Error(msg)
            }

            return dbConnection.query(
                `SELECT * FROM "subscription_data_1"`,
                { type: QueryTypes.SELECT }
            )
        }

        it (`error in case if incorrect column count`, async () => {
            await expect(
                upload({
                    types       : "integer,string,string,string",
                    labels      : "cnt,a,b,c",
                    descriptions: "cnt,a,b,c",
                    body        : 'cnt,a,b,c\n15,,,\n10,,,,,,'
                })
            ).to.be.eventually.rejectedWith(
                "Number of cells exceeds the number of columns (line: 3)"
            );
        })

        it (`error in case if incorrect column count in types parameter`, async () => {
            await expect(
                upload({
                    types       : "integer,string,string,string,string",
                    labels      : "cnt,a,b,c",
                    descriptions: "cnt,a,b,c",
                    body        : 'cnt,a,b,c\n15,,,\n10,,,'
                })
            ).to.be.eventually.rejectedWith("The number of data types does not match the number of columns");
        })

        it (`error in case of duplicate values`, async () => {
            await expect(
                upload({
                    types       : "integer,string,string,string",
                    labels      : "cnt,a,b,c",
                    descriptions: "cnt,a,b,c",
                    body        : 'cnt,a,b,c\n15,,,\n10,a,b,c\n10,a,b,c'
                })
            ).to.eventually.be.rejectedWith(
                /duplicate key value violates unique constraint.*?Key \(a, b, c\)=\(a, b, c\) already exists/
            );
        })

        it (`can upload csv with unquoted strings`, async () => {
            const cube = await upload({
                types       : "integer,string,string,string",
                labels      : "cnt,a,b,c",
                descriptions: "cnt,a,b,c",
                body        : 'cnt,a,b,c\n15,,,\n10,x y,z,'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null, c: null },
                { cnt: 10, a: 'x y', b: "z", c: null }
            ])
        })

        it (`can upload csv with quoted strings`, async () => {
            const cube = await upload({
                types       : "integer,string,string,string",
                labels      : "cnt,a,b,c",
                descriptions: "cnt,a,b,c",
                body        : 'cnt,a,b,c\n15,,,\n10,"x y","z",""'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null , b: null, c: null },
                { cnt: 10, a: 'x y', b: "z" , c: ""   }
            ])
        })

        it (`can upload csv with quoted strings containing delimiters`, async () => {
            const cube = await upload({
                types       : "integer,string,string,string",
                labels      : "cnt,a,b,c",
                descriptions: "cnt,a,b,c",
                body        : 'cnt,a,b,c\n15,,,\n10,"x, y",",",'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null  , b: null, c: null },
                { cnt: 10, a: 'x, y', b: "," , c: null }
            ])
        })

        it (`can upload csv with numeric values`, async () => {
            const cube = await upload({
                types       : "integer,integer,integer,float,float",
                labels      : "cnt,a,b,c,d",
                descriptions: "cnt,a,b,c,d",
                body        : 'cnt,a,b,c,d\n15,,,,\n10,9,-9,8.2,-7.4'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null, c: null , d: null   },
                { cnt: 10, a: "9" , b: "-9", c: "8.2", d: "-7.4" }
            ])
        })

        it (`can upload csv with year values`, async () => {
            const cube = await upload({
                types       : "integer,year,date:YYYY",
                labels      : "cnt,a,b",
                descriptions: "cnt,a,b",
                body        : 'cnt,a,b\n15,,\n10,2024-05-23,2024-05-23'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null },
                { cnt: 10, a: "2024-01-01T00:00:00Z", b: "2024-01-01T00:00:00Z" }
            ])
        })

        it (`can upload csv with month values`, async () => {
            const cube = await upload({
                types       : "integer,month,date:YYYY-MM",
                labels      : "cnt,a,b",
                descriptions: "cnt,a,b",
                body        : 'cnt,a,b\n15,,\n10,2024-05-23,2024-05-23'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null },
                { cnt: 10, a: "2024-05-01T00:00:00Z", b: "2024-05-01T00:00:00Z" }
            ])
        })

        it (`can upload csv with week values`, async () => {
            const cube = await upload({
                types       : "integer,week,date:YYYY wk W",
                labels      : "cnt,a,b",
                descriptions: "cnt,a,b",
                body        : 'cnt,a,b\n15,,\n10,2024-05-23,2024-05-23'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null },
                { cnt: 10, a: "2024-05-19T00:00:00Z", b: "2024-05-19T00:00:00Z" }
            ])
        })

        it (`can upload csv with day values`, async () => {
            const cube = await upload({
                types       : "integer,day,date:YYYY-MM-DD",
                labels      : "cnt,a,b",
                descriptions: "cnt,a,b",
                body        : 'cnt,a,b\n15,,\n10,2024-05-23,2024-05-23'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null },
                { cnt: 10, a: "2024-05-23T00:00:00Z", b: "2024-05-23T00:00:00Z" }
            ])
        })

        it (`can upload csv with non-numeric values quoted`, async () => {
            const cube = await upload({
                types       : "integer,day,boolean,float,string",
                labels      : "cnt,a,b,c,d",
                descriptions: "cnt,a,b,c,d",
                body        : 'cnt,a,b,c,d\n15,,,,\n10,"2024-05-23","false",3.5,"test"'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null, c: null, d: null },
                { cnt: 10, a: "2024-05-23T00:00:00Z", b: "false", c: "3.5", d: "test" }
            ])
        })

        it (`can upload csv with all values quoted`, async () => {
            const cube = await upload({
                types       : "integer,day,boolean,float,string",
                labels      : "cnt,a,b,c,d",
                descriptions: "cnt,a,b,c,d",
                body        : 'cnt,a,b,c,d\n"15",,,,\n"10","2024-05-23","false","3.5","test"'
            });

            expect(cube).to.deep.equal([
                { cnt: 15, a: null, b: null, c: null, d: null },
                { cnt: 10, a: "2024-05-23T00:00:00Z", b: "false", c: "3.5", d: "test" }
            ])
        })
    })
});