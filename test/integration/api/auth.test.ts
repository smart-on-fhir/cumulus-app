import { expect } from "chai"
import Users      from "../../fixtures/Users"
import {
    server,
    resetTable,
    admin,
    user,
    manager,
    recentlyInvitedUser,
    activatedUser,
    expiredUser
} from "../../test-lib"



describe("Auth", () => {

    afterEach(async () => await resetTable("User", Users))
    
    describe("login", () => {

        it ("requires username parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                method : "POST",
                headers: { "content-type": "application/json" },
                body   : JSON.stringify({})
            })
            expect(res.status).to.equal(401)
            expect(await res.text()).to.equal("Login failed")
        })

        it ("requires password parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                method : "POST",
                headers: { "content-type": "application/json" },
                body   : JSON.stringify({ username: admin.email })
            })
            expect(res.status).to.equal(401)
            expect(await res.text()).to.equal("Login failed")
        })

        it ("checks the password parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                method : "POST",
                headers: { "content-type": "application/json" },
                body   : JSON.stringify({ username: admin.email, password: "bad-password" })
            })
            expect(res.status).to.equal(401)
            expect(await res.text()).to.equal("Login failed")
        })

        it ("uses the remember parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                method : "POST",
                headers: { "content-type": "application/json" },
                body   : JSON.stringify({
                    username: admin.email,
                    password: admin.password,
                    remember: true
                })
            })
            expect(res.status).to.equal(200)
            expect(res.headers.get("set-cookie")).to.include("Expires=")
        })

        const users = { user, manager, admin, activatedUser };
        Object.keys(users).forEach(role => {
            const user = users[role as keyof typeof users]
            it (role + " can login", async () => {
                const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                    method : "POST",
                    headers: { "content-type": "application/json" },
                    body   : JSON.stringify({
                        username: user.email,
                        password: user.password
                    })
                })
                expect(res.status).to.equal(200)
                expect(await res.json()).to.haveOwnProperty("id").that.equals(user.id)
            })
        })

        const nonUsers = { recentlyInvitedUser, expiredUser };
        Object.keys(nonUsers).forEach(role => {
            const user = nonUsers[role as keyof typeof nonUsers]
            it (role + " cannot login", async () => {
                const res = await fetch(`${server.baseUrl}/api/auth/login`, {
                    method : "POST",
                    headers: { "content-type": "application/json" },
                    body   : JSON.stringify({
                        username: user.email,
                        password: user.password
                    })
                })
                expect(res.status).to.equal(401)
            })
        })
    })

    describe("logout", () => {
        
        it ("works", async () => {
            const res = await fetch(`${server.baseUrl}/api/auth/logout`, {
                headers: { cookie: `sid=${admin.sid}` }
            })
            expect(res.status).to.equal(200)
            expect(res.headers.get("set-cookie")).to.include("sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
        })

    })

});
