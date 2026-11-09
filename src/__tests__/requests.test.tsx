import { json } from "express";
import { it } from "vitest"
import MockServer  from "../../test/MockServer"
import { auth, createOne, deleteOne, request, updateOne } from "../backend"


describe("request utils", () => {
    
    const mockServer = new MockServer("Mock Server", true)

    beforeAll(async () => {
        await mockServer.start()
    })

    afterAll (async () => {
        await mockServer.stop()
    })

    afterEach(() => {
        mockServer.clear()
        vi.restoreAllMocks()
    })

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

        it.each([
            "/api/users?order=createdAt:desc",
            "/api/users?attributes=email",
            "/api/views",
            "/api/requests/123",
            "/api/permissions/list?resource=Views"
        ])("bypasses the browser cache for mutable Node data: %s", async path => {
            const fetchSpy = vi.spyOn(globalThis, "fetch")
                .mockResolvedValue(new Response("[]", { headers: { "content-type": "application/json" } }))

            await request(path)

            const options = fetchSpy.mock.calls[0][1]!
            expect(options.cache).toBe("no-store")
            expect(new Headers(options.headers).has("cache-control")).toBe(false)
        })

        it.each([
            "/api/aggregator/data-packages",
            "/api/aggregator/static/catalog/icd10",
            "/api/requests/pkg-api?pkg=example",
            "/api/requests/123/api?column=age",
            "/api/requests/123/raw-data"
        ])("preserves caching for aggregator and chart data: %s", async path => {
            const fetchSpy = vi.spyOn(globalThis, "fetch")
                .mockResolvedValue(new Response("[]", { headers: { "content-type": "application/json" } }))

            await request(path)

            const options = fetchSpy.mock.calls[0][1]!
            expect(options.cache).not.toBe("no-store")
            expect(new Headers(options.headers).get("cache-control")).toBe("max-age=2592000, stale-while-revalidate=86400")
        })

        it ("preserves explicit cache settings and request headers", async () => {
            const fetchSpy = vi.spyOn(globalThis, "fetch")
                .mockResolvedValue(new Response("{}"))

            await request("/api/users", {
                cache: "reload",
                headers: new Headers({ "x-example": "value" })
            })

            const options = fetchSpy.mock.calls[0][1]!
            expect(options.cache).toBe("reload")
            expect(new Headers(options.headers).get("x-example")).toBe("value")
            expect(new Headers(options.headers).has("cache-control")).toBe(false)
        })

        it ("preserves the existing cache header for mutations", async () => {
            const fetchSpy = vi.spyOn(globalThis, "fetch")
                .mockResolvedValue(new Response("{}"))

            await request("/api/users/invite", { method: "POST" })

            const options = fetchSpy.mock.calls[0][1]!
            expect(options.cache).toBeUndefined()
            expect(new Headers(options.headers).get("cache-control")).toBe("max-age=2592000, stale-while-revalidate=86400")
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