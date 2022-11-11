const { expect } = require("chai")
const { ACL, roles } = require("../../backend/acl")
const { hasPermission, requestPermission } = require("../../backend/controllers/Auth")


describe("ACL", () => {

    /** @type any */
    const actions = Object.keys(ACL);

    it ("hasPermission rejects unknown action", () => {
        // @ts-ignore
        expect(hasPermission("x", Object.keys(roles)[0])).to.equal(false)
    })

    it ("hasPermission rejects unknown role", () => {
        // @ts-ignore
        expect(hasPermission(actions[0], "bad-role")).to.equal(false)
    })

    actions.forEach(action => {
        for (const role in roles) {
            const allowed = !!ACL[action][roles[role]];
            it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to perform "${action}" action`, () => {
                // @ts-ignore
                expect(hasPermission(action, role)).to.equal(allowed)

                const check = () => {
                    requestPermission(
                        action,
                        // @ts-ignore
                        role === "guest" ? {} : { user: { role } },
                        role === "owner"
                    );
                };

                if (allowed) {
                    expect(check).not.to.throw
                }
                else {
                    expect(check).to.throw(/Permission denied/)
                }
            })
        }
    })
})