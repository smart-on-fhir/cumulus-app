import { json } from "express";
import MockServer  from "../../test/MockServer"
import { auth, createOne, deleteOne, request, updateOne } from "../backend"


describe("request utils", () => {
    
    let REACT_APP_BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
    
    const mockServer = new MockServer("Mock Server", true)

    beforeAll(async () => {
        await mockServer.start()
        process.env.REACT_APP_BACKEND_HOST = mockServer.baseUrl
    })

    afterAll (async () => {
        process.env.REACT_APP_BACKEND_HOST = REACT_APP_BACKEND_HOST
        await mockServer.stop()
    })

    afterEach(() => mockServer.clear())

    describe("request", () => {
        it ("uses the body text as error message in case of error", async () => {
            mockServer.mock("/", { status: 400, body: "test-error" })
            await expect(() => request(mockServer.baseUrl + "/")).rejects.toThrow("test-error")
        })

        it ("can use the generic error messages", async () => {
            mockServer.mock("/", { status: 400 })
            await expect(() => request(mockServer.baseUrl + "/")).rejects.toThrow("Bad Request")
        })

        it ("returns the body as is by default", async () => {
            mockServer.mock("/", { body: "test body" })
            const body = await request(mockServer.baseUrl + "/")
            expect(body).toEqual("test body")
        })

        it ("parses json responses automatically", async () => {
            mockServer.mock("/", { body: { x: 5 }})
            const body = await request(mockServer.baseUrl + "/")
            expect(body).toEqual({ x: 5 })
        })
    })

    it ("createOne", async () => {
        mockServer.mock({
            method: "post",
            path: "/api/collection"
        }, {
            bodyParser: json(),
            handler: (req, res) => res.json(req.body)
        })
        const body = await createOne("collection", { x: 1 })
        expect(body).toEqual({ x: 1 })
    })

    it ("updateOne", async () => {
        mockServer.mock({
            method: "put",
            path  : "/api/collection/:id"
        }, {
            bodyParser: json(),
            handler: (req, res) => res.json(req.body)
        })
        const body = await updateOne("collection", 5, { x: 1, id: 6 })
        expect(body).toEqual({ x: 1 })
    })

    it ("deleteOne", async () => {
        mockServer.mock({
            method: "delete",
            path  : "/api/collection/:id"
        }, { body: "ok" })
        await expect(deleteOne("collection", 5)).resolves.toEqual("ok")
    })

    it ("auth.login", async () => {
        mockServer.mock({
            method: "post",
            path  : "/api/auth/login"
        }, { body: "ok" })
        await expect(auth.login("user", "pass", false)).resolves.toEqual("ok")
    })

    it ("auth.logout", async () => {
        mockServer.mock("/api/auth/logout", { body: "ok" })
        await expect(auth.logout()).resolves.toEqual("ok")
    })
})