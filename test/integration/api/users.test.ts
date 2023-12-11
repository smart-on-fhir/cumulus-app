import { expect } from "chai"
import Users from "../../fixtures/Users"
import {
    server,
    resetTable,
    admin,
    user,
    manager,
    recentlyInvitedUser,
    activatedUser,
    expiredUser,
    testEndpoint
} from "../../test-lib"



describe("Users", () => {

    afterEach(async () => await resetTable("User", Users))
    
    describe("list (GET /api/users)", () => {

        testEndpoint("Users.read", "GET", "/api/users")

        it ("handles bad parameter errors", async () => {

            const res = await fetch(`${server.baseUrl}/api/users?include=x`, { headers: { Cookie: "sid=" + admin.sid }})
            // console.log("=====>", await res.text())
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error reading users")
            // console.log(res.status, await res.text())
        })
    })

    describe("view (GET /api/users/me)", () => {
        
        it ("admin can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(admin.id)
        })

        it ("manager can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(manager.id)
        })

        it ("user can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(user.id)
        })

        it ("guest cannot view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`)
            const json = await res.json()
            expect(json).to.haveOwnProperty("id").that.equals(-1)
            expect(json).to.haveOwnProperty("role").that.equals("guest")
            expect(json).to.haveOwnProperty("permissions").that.deep.equals([])
        })
    })

    describe("view (GET /api/users/:id)", () => {
        
        testEndpoint("Users.read", "GET", "/api/users/" + admin.id)

        it ("admin can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/${admin.id}`, { headers: { Cookie: "sid=" + admin.sid } })
            // console.log(await res.text())
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(admin.id)
        })

        it ("manager can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/${manager.id}`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(manager.id)
        })

        it ("user can view himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/${user.id}`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(user.id)
        })

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/22`, { headers: { Cookie: "sid=" + admin.sid }})
            // console.log("====>", await res1.text())
            expect(res1.status).to.equal(404)
            expect(await res1.text()).to.equal("User not found")

            const res = await fetch(`${server.baseUrl}/api/users/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("User not found")
        })
    })

    describe("create (POST /api/users)", () => {

        testEndpoint("Users.create", "POST", "/api/users", { email: "test@whatever.org", role: "user" })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/users`, {
                method: "POST",
                body: JSON.stringify({ email: "test", role: "bad-role" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error creating user")
            // console.log(await res.text())
        })
    })
    
    describe("update (PUT /api/users/:id)", () => {

        testEndpoint("Users.update", "PUT", "/api/users/1", { name: "Cumulus user (updated)" })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({ role: "x" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error updating user")
        })
    })
    
    describe("delete (DELETE /api/users/:id)", () => {

        testEndpoint("Users.delete", "DELETE", "/api/users/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/33`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)
            expect(await res1.text()).to.equal("User not found")
            // console.log(await res1.text())

            const res2 = await fetch(`${server.baseUrl}/api/users/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
            // expect(await res2.text()).to.equal("Error deleting user")
            // console.log(await res2.text())
        })
    })
    
    describe("invite (POST /api/users/invite)", () => {
        
        it ("guest cannot invite other users", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "whoever@wherever.org", role: "user" }),
                headers: {
                    "content-type": "application/json"
                }
            })
            // console.log("=====>", await res.text())
            expect(res.status).to.equal(401)
        })

        it ("user cannot invite other users", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "whoever@wherever.org", role: "user" }),
                headers: {
                    Cookie: "sid=" + user.sid,
                    "content-type": "application/json"
                }
            })
            // console.log("=====>", await res.text())
            expect(res.status).to.equal(403)
        })

        it ("manager cannot invite other users", async () => {
            const res = await fetch(
                `${server.baseUrl}/api/users/invite`,
                {
                    method: "POST",
                    body: JSON.stringify({ email: "whoever@wherever.org", role: "user" }),
                    headers: {
                        Cookie: "sid=" + manager.sid,
                        "content-type": "application/json"
                    }
                }
            )
            // console.log("=====>", await res.text())
            expect(res.status).to.equal(403)
        })

        it ("requires email parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({}),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing email property")
        })

        it ("requires role parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "x" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing role property")
        })

        it ("fails with invalid parameters", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "x", role: "y" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error crating new user")
        })

        it ("rejects for already invited users", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: recentlyInvitedUser.email, role: "user" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal("User already invited")
        })

        it ("rejects if mail cannot be sent", async () => {
            
            const resolved = require.resolve("../../../backend/mail");
            
            const cachedModule: any = require.cache[resolved]
            
            const orig = cachedModule.exports.inviteUser;

            cachedModule.exports.inviteUser = async () => {
                throw new Error("Sending email failed")
            };

            afterEach(() => { cachedModule.exports.inviteUser = orig; });
            
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "whoever@wherever.org", role: "user" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            });
            expect(res.status).to.equal(500)
            expect(await res.text()).to.equal("Error sending invitation email")
        })

        it ("works as expected", async () => {

            const resolved = require.resolve("../../../backend/mail");
            
            const cachedModule: any = require.cache[resolved]
            
            const orig = cachedModule.exports.inviteUser;

            cachedModule.exports.inviteUser = async () => true;

            afterEach(() => { cachedModule.exports.inviteUser = orig; });
            
            const res = await fetch(`${server.baseUrl}/api/users/invite`, {
                method: "POST",
                body: JSON.stringify({ email: "whoever@wherever.org", role: "user" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            });

            expect(res.status).to.equal(200)
            expect(await res.json()).to.deep.equal({ message: "User invited" })

            const res2 = await fetch(`${server.baseUrl}/api/users`, { headers: { Cookie: "sid=" + admin.sid }});
            expect((await res2.json()).find((u: any) => u.email === "whoever@wherever.org")).to.exist

        })
    })
    
    describe("check invitation (GET /api/users/activate/:code)", () => {
        
        it ("handles missing code parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate/`)
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing code parameter")
        })

        it ("handles invalid code parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate/x`)
            expect(res.status).to.equal(404)
            expect(await res.text()).to.equal("Invalid or expired invitation")
        })

        it ("works with recently invited users", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate/${recentlyInvitedUser.activationCode}`)
            expect(res.status).to.equal(200)
            expect(await res.text()).to.equal("Pending activation")
        })

        it ("works with activated users", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate/${activatedUser.activationCode}`)
            expect(res.status).to.equal(409)
            expect(await res.text()).to.equal("Account already activated")
        })

        it ("works with expired invitations", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate/${expiredUser.activationCode}`)
            expect(res.status).to.equal(410)
            expect(await res.text()).to.equal("Expired invitation")
        })
    })
    
    describe("activate (POST /api/users/activate)", () => {
        
        it ("handles missing code parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({}),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing code parameter")
        })

        it ("handles missing name parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({ code: "x" }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing name parameter")
        })

        it ("handles missing newPassword1 parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({ code: "x", name: "x" }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing newPassword1 parameter")
        })

        it ("handles missing newPassword2 parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({ code: "x", name: "x", newPassword1: "x" }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.include("Missing newPassword2 parameter")
        })

        it ("handles invalid code parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({ code: "x", name: "x", newPassword1: "x", newPassword2: "x" }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(404)
            expect(await res.text()).to.equal("Invalid or expired invitation")
        })

        it ("rejects already activated accounts", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({
                    code: activatedUser.activationCode,
                    name: "x",
                    newPassword1: "x",
                    newPassword2: "x"
                }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(409)
            expect(await res.text()).to.equal("Account already activated")
        })

        it ("rejects expired invitations", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({
                    code: expiredUser.activationCode,
                    name: "x",
                    newPassword1: "x",
                    newPassword2: "x"
                }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(410)
            expect(await res.text()).to.equal("Expired invitation")
        })

        it ("rejects password mismatch", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({
                    code: recentlyInvitedUser.activationCode,
                    name: "x",
                    newPassword1: "x",
                    newPassword2: "y"
                }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal("Passwords do not match")
        })

        it ("rejects invalid password", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({
                    code: recentlyInvitedUser.activationCode,
                    name: "x",
                    newPassword1: "x",
                    newPassword2: "x"
                }),
                headers: { "content-type": "application/json" }
            })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal("Error activating account")
        })

        it ("works as expected with valid inputs", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/activate`, {
                method: "POST",
                body: JSON.stringify({
                    code: recentlyInvitedUser.activationCode,
                    name: "just activated",
                    newPassword1: "Xyz#1234",
                    newPassword2: "Xyz#1234"
                }),
                headers: {
                    "content-type": "application/json"
                }
            })
            // console.log("====>", await res.text())
            expect(res.status).to.equal(200)
            expect(await res.json()).to.deep.equal({ name: "just activated" })
        })
    })
    
    describe("update account (PUT /api/users/me)", () => {

        it ("admin can update himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: admin.password
                }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("email").that.equals(admin.email)
            expect(json).to.haveOwnProperty("name").that.equals("updated")
        })

        it ("manager can update himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: manager.password
                }),
                headers: {
                    Cookie: "sid=" + manager.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("email").that.equals(manager.email)
            expect(json).to.haveOwnProperty("name").that.equals("updated")
        })

        it ("user can update himself", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: user.password
                }),
                headers: {
                    Cookie: "sid=" + user.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("email").that.equals(user.email)
            expect(json).to.haveOwnProperty("name").that.equals("updated")
        })

        it ("guest cannot update themselves", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: "whatever"
                }),
                headers: {
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
        })

        it ("invalid user cannot update themselves", async () => {
            const res = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: "whatever"
                }),
                headers: {
                    Cookie: "sid=unknown-user-sid",
                    "content-type": "application/json"
                }
            })
            // console.log(await res.text())
            expect(res.status).to.equal(404)
            expect(await res.text()).to.equal("User not found")
        })

        it ("handles missing password2", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: admin.password,
                    newPassword1: "new-password-1"
                }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res1.status).to.equal(400)
            // expect(await res1.text()).to.equal("Missing newPassword2 parameter")
            // console.log(await res1.text())
        })

        it ("handles bad new password", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: admin.password,
                    newPassword1: "new-password-1",
                    newPassword2: "new-password-2"
                }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res1.status).to.equal(400)
            expect(await res1.text()).to.equal("New passwords do not match")
        })

        it ("handles bad password", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: "bad-password"
                }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res1.status).to.equal(403)
            expect(await res1.text()).to.equal("Invalid password")
        })

        it ("handles bad parameters", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/users/me`, {
                method: "PUT",
                body: JSON.stringify({
                    name    : "updated",
                    password: admin.password,
                    newPassword1: "newPass",
                    newPassword2: "newPass"
                }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res1.status).to.equal(400)
            expect(await res1.text()).to.equal("Error updating account")
        })
    })
});
