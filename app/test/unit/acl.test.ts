import { expect }                           from "chai"
// import { ACL, roles }                       from "../../backend/acl"
// import { hasPermission, requestPermission } from "../../backend/controllers/Auth"


// type Action = keyof typeof ACL
// type Role   = keyof typeof roles


describe("ACL", () => {

    // const actions = Object.keys(ACL);

    // it ("hasPermission rejects unknown action", () => {
    //     expect(hasPermission("x" as Action, Object.keys(roles)[0] as Role)).to.equal(false)
    // })

    // it ("hasPermission rejects unknown role", () => {
    //     expect(hasPermission(actions[0] as Action, "bad-role" as Role)).to.equal(false)
    // })

    // actions.forEach(action => {
    //     for (const role in roles) {
    //         const allowed = !!ACL[action as Action][roles[role as Role]];
    //         it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to perform "${action}" action`, () => {
    //             expect(hasPermission(action as Action, role as Role)).to.equal(allowed)

    //             const check = () => {
    //                 requestPermission(
    //                     action as Action,
    //                     // @ts-ignore
    //                     role === "guest" ? {} : { user: { role } },
    //                     role === "owner"
    //                 );
    //             };

    //             if (allowed) {
    //                 expect(check).not.to.throw
    //             }
    //             else {
    //                 expect(check).to.throw(/Permission denied/)
    //             }
    //         })
    //     }
    // })
})