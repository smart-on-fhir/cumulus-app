import { expect, use }               from "chai"
import chaiAsPromised                from "chai-as-promised"
import Subscription                  from "../../../backend/db/models/Subscription"
import DataSite                      from "../../../backend/db/models/DataSite"
import Permission                    from "../../../backend/db/models/Permission"
import StudyArea                     from "../../../backend/db/models/StudyArea"
import RequestGroup                  from "../../../backend/db/models/RequestGroup"
import Tag                           from "../../../backend/db/models/Tag"
import User                          from "../../../backend/db/models/User"
import UserGroup                     from "../../../backend/db/models/UserGroup"
import View                          from "../../../backend/db/models/View"
import { explode }                   from "../../../backend/lib"
import { emailsToUserIDs, validate } from "../../../backend/routes/permissions"
import SystemUser                    from "../../../backend/SystemUser"
import Subscriptions                 from "../../fixtures/Subscriptions"
import DataSites                     from "../../fixtures/DataSites"
import Permissions                   from "../../fixtures/Permissions"
import StudyAreas                    from "../../fixtures/StudyAreas"
import RequestGroups                 from "../../fixtures/RequestGroups"
import Tags                          from "../../fixtures/Tags"
import UserGroups                    from "../../fixtures/UserGroups"
import Users                         from "../../fixtures/Users"
import {
    admin,
    resetTable,
    server,
    testEndpoint
} from "../../test-lib"


use(chaiAsPromised);


describe("Permissions", () => {
        
    beforeEach(async () => await resetTable("Permission", Permissions))

    describe("list", () => {
        testEndpoint("Permissions.read", "GET", "/api/permissions")
    })

    describe("view", () => {
        testEndpoint("Permissions.read", "GET", "/api/permissions/1")
    })

    it ("create is not implemented", async () => {
        const res = await fetch(`${server.baseUrl}/api/permissions`, { method: "POST" })
        expect(res.status).to.equal(404)
    })

    // it ("update is not implemented", async () => {
    //     const res = await fetch(`${server.baseUrl}/api/permissions/1`, { method: "PUT" })
    //     expect(res.status).to.equal(404)
    // })

    it ("delete is not implemented", async () => {
        const res = await fetch(`${server.baseUrl}/api/permissions/1`, { method: "DELETE" })
        expect(res.status).to.equal(404)
    })

    it ("explode", () => {
        expect(explode([{ a: 1, b: [1, 2], c: [4, 5] }])).to.deep.equal([
            { a: 1, b: 1, c: 4 },
            { a: 1, b: 2, c: 4 },
            { a: 1, b: 1, c: 5 },
            { a: 1, b: 2, c: 5 }
        ])
    })

    describe ("buildPermissions", () => {

        it ("Allow all users to read all SubscriptionGroups", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : null,
                role         : "user",
                user_id      : null,
                user_group_id: null,
                action       : ["read"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : null,
                    role         : "user",
                    user_id      : null,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                }
            ])
        })

        it ("Allow all users to read one SubscriptionGroup", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : [1],
                role         : "user",
                user_id      : null,
                user_group_id: null,
                action       : ["read"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 1,
                    role         : "user",
                    user_id      : null,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                }
            ])
        })

        it ("Allow all users to read two SubscriptionGroups", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : [1, 2],
                role         : "user",
                user_id      : null,
                user_group_id: null,
                action       : ["read"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 1,
                    role         : "user",
                    user_id      : null,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                },
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 2,
                    role         : "user",
                    user_id      : null,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                }
            ])
        })

        it ("Allow two users to read two SubscriptionGroups", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : [1, 2],
                role         : null,
                user_id      : [1, 2],
                user_group_id: null,
                action       : ["read"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 1,
                    role         : null,
                    user_id      : 1,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                },
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 2,
                    role         : null,
                    user_id      : 1,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                },
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 1,
                    role         : null,
                    user_id      : 2,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                },
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 2,
                    role         : null,
                    user_id      : 2,
                    user_group_id: null,
                    action       : "read",
                    permission   : true
                }
            ])
        })

        it ("Allow all users from given user group to read two SubscriptionGroups", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : [1, 2],
                role         : null,
                user_id      : null,
                user_group_id: [3],
                action       : ["read"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 1,
                    role         : null,
                    user_id      : null,
                    user_group_id: 3,
                    action       : "read",
                    permission   : true
                },
                {
                    resource     : "SubscriptionGroups",
                    resource_id  : 2,
                    role         : null,
                    user_id      : null,
                    user_group_id: 3,
                    action       : "read",
                    permission   : true
                }
            ])
        })

        it ("Allow two users to read and update two SubscriptionGroups", () => {
            const rows = explode([{
                resource     : "SubscriptionGroups",
                resource_id  : [1, 2],
                role         : null,
                user_id      : [3, 4],
                user_group_id: null,
                action       : ["read", "update"],
                permission   : true
            }])

            expect(rows).to.deep.equal([
                // User#3.read.SubscriptionGroups#1
                { resource: "SubscriptionGroups", resource_id: 1, role: null, user_id: 3, user_group_id: null, action: "read"  , permission: true },
                // User#3.read.SubscriptionGroups#2
                { resource: "SubscriptionGroups", resource_id: 2, role: null, user_id: 3, user_group_id: null, action: "read"  , permission: true },
                // User#4.read.SubscriptionGroups#1
                { resource: "SubscriptionGroups", resource_id: 1, role: null, user_id: 4, user_group_id: null, action: "read"  , permission: true },
                // User#4.read.SubscriptionGroups#1
                { resource: "SubscriptionGroups", resource_id: 2, role: null, user_id: 4, user_group_id: null, action: "read"  , permission: true },
                // User#3.update.SubscriptionGroups#1
                { resource: "SubscriptionGroups", resource_id: 1, role: null, user_id: 3, user_group_id: null, action: "update", permission: true },
                // User#3.update.SubscriptionGroups#2
                { resource: "SubscriptionGroups", resource_id: 2, role: null, user_id: 3, user_group_id: null, action: "update", permission: true },
                // User#4.update.SubscriptionGroups#1
                { resource: "SubscriptionGroups", resource_id: 1, role: null, user_id: 4, user_group_id: null, action: "update", permission: true },
                // User#4.update.SubscriptionGroups#2
                { resource: "SubscriptionGroups", resource_id: 2, role: null, user_id: 4, user_group_id: null, action: "update", permission: true },
            ])
        })

    })

    describe("Share", () => {

        function buildLabel(props: any) {
            // console.log(props)
            let label = "";

            if (props.user_group_id) {
                if (Array.isArray(props.user_group_id)) {
                    label += `Members of user group #${ props.user_group_id.join(", #") }`
                } else {
                    label += `Members of user group #${ props.user_group_id }`
                }
            } else if (props.role) {
                label += `Users with role "${props.role}"`
            } else if (props.email) {
                if (Array.isArray(props.email)) {
                    label += `Users ${ props.email.join(", ") }`
                } else {
                    label += `User ${ props.email }`
                }
            }

            if (props.permission === true) {
                label += ` can be granted permission to`
            } else if (props.permission === false) {
                label += ` can be revoked permission to`
            }

            if (props.action) {
                label += " " + props.action
            }

            label += " " + props.resource

            if (props.resource_id) {
                if (Array.isArray(props.resource_id)) {
                    label += ` #${ props.resource_id.join(", #") }`
                } else {
                    label += `#${ props.resource_id }`
                }
            }


            return label;
        }

        describe("Validation", () => {
    
            it ("Requires resource parameter", async () => {
                expect(validate({})).to.eventually.be.rejectedWith("A 'resource' parameter is required")
            })
    
            it ("Requires the resource parameter to be a string", async () => {
                expect(validate({ resource: 5 })).to.eventually.be.rejectedWith("The 'resource' parameter must be a string")
            })
    
            it ("Requires valid resource parameters", async () => {
                expect(validate({ resource: "x" })).to.eventually.be.rejectedWith(`The 'resource' parameter ("x") does not point to any resource that can be shared`)
            })
    
            it ("Validates resource_id parameter", async () => {
                expect(validate({ resource: "Graphs", resource_id: "x" })).to.eventually.be.rejectedWith("Invalid 'resource_id' parameter")
            })
    
            it ("Validates resource_id parameter arrays", async () => {
                expect(validate({ resource: "Graphs", resource_id: [5, "x"] })).to.eventually.be.rejectedWith("Invalid 'resource_id' parameter")
            })
    
            it ("Verifies that resource_id parameters exit in DB", async () => {
                expect(validate({ resource: "Graphs", resource_id: [5, 4444] })).to.eventually.be.rejectedWith("Some 'resource_id' parameters are not found in DB")
            })
    
            it ("Requires email or role or user_group_id", async () => {
                expect(validate({ resource: "Graphs", resource_id: 1 })).to.eventually.be.rejectedWith("Please specify who should we share this with")
            })
    
            it ("Requires that only one of email, role or user_group_id is passed", async () => {
                expect(validate({ resource: "Graphs", resource_id: 1, email: "x", role: "user" })).to.eventually.be.rejectedWith("Only one of email, role or user_group_id can be used")
            })
    
            it ("Verifies that user_group_id parameters exist in DB", async () => {
                expect(validate({ resource: "Graphs", user_group_id: [5, 4444] })).to.eventually.be.rejectedWith("Some 'user_group_id' parameters are not found in DB")
            })
    
            it ("Verifies that email parameters exist in DB", async () => {
                expect(validate({ resource: "Graphs", resource_id: 1, email: "x" })).to.eventually.be.rejectedWith("Some 'email' parameters were not found in DB")
            })
            
            it ("Verifies that role parameters are valid", async () => {
                expect(validate({ resource: "Graphs", resource_id: 1, role: "user-x" })).to.eventually.be.rejectedWith("Invalid role parameter")
            })
    
        })

        describe("POST /api/permissions/grant", () => {

            function share(body: Record<string, any>) {
                return fetch(`${server.baseUrl}/api/permissions/grant`, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        Cookie: "sid=" + admin.sid,
                        "content-type": "application/json"
                    }
                })
            }
    
            beforeEach(async () => {
                await Permission.destroy({ where: { resource: "Graphs" }, user: SystemUser })
            })
    
            afterEach(async () => {
                await resetTable("Permission", Permissions)
            })
    
            const matrix = explode([
                {
                    resource     : "Graphs",
                    resource_id  : [null, 1],
                    role         : ["user", "manager", "guest", null],
                    user_group_id: [null, 1],
                    email        : [null, "user@cumulus.test"],
                    action       : ["read", "update", "delete", "share"],
                    permission   : true
                }
            ]);
    
            function testGrant(x: any) {
                it (buildLabel(x), async () => {
                        
                    // Pre-check
                    expect(await Permission.count({
                        where: {
                            resource  : x.resource,
                            role      : x.role,
                            action    : x.action,
                            permission: x.permission,
                        }
                    })).equal(0);
    
                    const res = await share({
                        resource     : x.resource,
                        role         : x.role,
                        action       : x.action,
                        permission   : x.permission,
                        email        : x.email,
                        user_group_id: x.user_group_id,
                        resource_id  : x.resource_id
                    })
        
                    const json = await res.json()
        
                    expect(json).to.deep.equal({ ok: true })
    
                    // Post-check ----------------------------------------------
                    const { email, ...rest } = x
                    if (email) {
                        const emails = Array.isArray(email) ? email : [email];
                        const user_ids = await emailsToUserIDs(emails)
    
                        for (const user_id of user_ids) {
                            expect(await Permission.count({ where: {
                                ...rest,
                                user_id
                            } }), `Post-check for user_id=${user_id}`).to.equal(1);
                        }
                    } else {
                        expect(await Permission.count({ where: rest })).to.equal(1);
                    }
                })
            }
    
            matrix.forEach((x: any) => {
                if (
                    ( x.user_group_id && !x.role && !x.email) ||
                    (!x.user_group_id && !x.role &&  x.email) || 
                    (!x.user_group_id &&  x.role && !x.email)
                ) {
                    testGrant(x)
                }
            })
        })

        // describe("POST /api/permissions/revoke", () => {

        //     const matrix = explode([
        //         {
        //             resource     : "Graphs",
        //             resource_id  : [null, 1],
        //             role         : ["user", "manager", "guest", null],
        //             user_group_id: [null, 1],
        //             email        : [null, "user@cumulus.test"],
        //             action       : ["read", "update", "delete", "share"],
        //             permission   : false
        //         }
        //     ]);

        //     function revoke(body: Record<string, any>) {
        //         return fetch(`${server.baseUrl}/api/permissions/revoke`, {
        //             method: "POST",
        //             body: JSON.stringify(body),
        //             headers: {
        //                 Cookie: "sid=" + admin.sid,
        //                 "content-type": "application/json"
        //             }
        //         })
        //     }
    
        //     beforeEach(async () => {
        //         await resetTable("Permission", Permissions)
        //         await Permission.bulkCreate([
        //             { resource: "Graphs", role: "admin"   , action: "share" , permission: true },
        //             { resource: "Graphs", role: "manager" , action: "share" , permission: true },
        //             { resource: "Graphs", role: "user"    , action: "read"  , permission: true },
        //             { resource: "Graphs", role: "user"    , action: "update", permission: true },
        //             { resource: "Graphs", role: "user"    , action: "delete", permission: true },
        //             { resource: "Graphs", role: "user"    , action: "share" , permission: true },
        //             { resource: "Graphs", role: "guest"   , action: "read"  , permission: true },
        //             { resource: "Graphs", role: "guest"   , action: "update", permission: true },
        //             { resource: "Graphs", role: "guest"   , action: "delete", permission: true },
        //             { resource: "Graphs", role: "guest"   , action: "share" , permission: true },
        //             { resource: "Graphs", user_id: 3      , action: "read"  , permission: true },
        //             { resource: "Graphs", user_id: 3      , action: "update", permission: true },
        //             { resource: "Graphs", user_id: 3      , action: "delete", permission: true },
        //             { resource: "Graphs", user_id: 3      , action: "share" , permission: true },
        //             { resource: "Graphs", user_group_id: 1, action: "read"  , permission: true },
        //             { resource: "Graphs", user_group_id: 1, action: "update", permission: true },
        //             { resource: "Graphs", user_group_id: 1, action: "delete", permission: true },
        //             { resource: "Graphs", user_group_id: 1, action: "share" , permission: true },
        //             { resource: "Graphs", role: "user"    , action: "read"  , permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "user"    , action: "update", permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "user"    , action: "delete", permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "user"    , action: "share" , permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "guest"   , action: "read"  , permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "guest"   , action: "update", permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "guest"   , action: "delete", permission: true, resource_id: 1 },
        //             { resource: "Graphs", role: "guest"   , action: "share" , permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_id: 3      , action: "read"  , permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_id: 3      , action: "update", permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_id: 3      , action: "delete", permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_id: 3      , action: "share" , permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_group_id: 1, action: "read"  , permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_group_id: 1, action: "update", permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_group_id: 1, action: "delete", permission: true, resource_id: 1 },
        //             { resource: "Graphs", user_group_id: 1, action: "share" , permission: true, resource_id: 1 },
        //         ])
        //     })
    
        //     afterEach(async () => {
        //         await resetTable("Permission", Permissions)
        //     })

        //     function testRevoke(x: any) {
        //         it (buildLabel(x), async () => {
                        
        //             // Pre-check
        //             expect(await Permission.count({
        //                 where: {
        //                     resource  : x.resource,
        //                     role      : x.role,
        //                     action    : x.action,
        //                     permission: true,
        //                 }
        //             })).be.greaterThan(0);
    
        //             const res = await revoke({
        //                 resource     : x.resource,
        //                 role         : x.role,
        //                 action       : x.action,
        //                 permission   : false,
        //                 email        : x.email,
        //                 user_group_id: x.user_group_id,
        //                 resource_id  : x.resource_id
        //             })
        
        //             const json = await res.json()
        
        //             expect(json).to.deep.equal({ ok: true })
    
        //             // Post-check ----------------------------------------------
        //             const { email, ...rest } = x
        //             if (email) {
        //                 const emails = Array.isArray(email) ? email : [email];
        //                 const user_ids = await emailsToUserIDs(emails)
    
        //                 for (const user_id of user_ids) {
        //                     expect(await Permission.count({ where: {
        //                         ...rest,
        //                         user_id
        //                     } }), `Post-check for user_id=${user_id}`).to.equal(0);
        //                 }
        //             } else {
        //                 expect(await Permission.count({ where: rest })).equal(0);
        //             }
        //         })
        //     }
    

        //     matrix.forEach((x: any) => {
        //         if (
        //             ( x.user_group_id && !x.role && !x.email) ||
        //             (!x.user_group_id && !x.role &&  x.email) || 
        //             (!x.user_group_id &&  x.role && !x.email)
        //         ) {
        //             testRevoke(x)
        //         }
        //     })
        // })
    })

    describe("actions", () => {
        it ("requires resource parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/permissions/actions`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal('Invalid or missing "resource" parameter')
        })

        it ("requires valid resource parameter", async () => {
            const res = await fetch(`${server.baseUrl}/api/permissions/actions?resource=x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal('Invalid or missing "resource" parameter')
        })

        it ("works as expected", async () => {
            const res = await fetch(`${server.baseUrl}/api/permissions/actions?resource=Graphs`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.deep.equal(["read", "update", "delete", "share"])
        })
    })

    describe("Data Integrity", () => {

        // beforeEach(async () => {
        //     await resetTable("Permission", Permissions)
        // })

        afterEach(async () => {
            await resetTable("Permission"  , Permissions  )
            await resetTable("User"        , Users        )
            await resetTable("Subscription", Subscriptions )
            await resetTable("DataSite"    , DataSites    )
            await resetTable("UserGroup"   , UserGroups   )
            await resetTable("RequestGroup", RequestGroups)
            await resetTable("Tag"         , Tags         )
            await resetTable("StudyArea"   , StudyAreas   )
        })

        it ("When a Graph is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "Graphs", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "Graphs", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "Graphs", resource_id: 1 } })).to.be.greaterThan(0)
            const graph = await View.findByPk(1, { user: SystemUser })
            await graph!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "Graphs", resource_id: 1 } })).to.equal(0)
        })

        it ("When a User is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "Graphs", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "Graphs", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "Graphs", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { user_id: 3 } })).to.be.greaterThan(0)
            const user = await User.findByPk(3, { user: SystemUser,  })
            await user!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { user_id: 3 } })).to.equal(0)
        })

        it ("When a Subscription is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "Subscriptions", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "Subscriptions", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "Subscriptions", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "Subscriptions", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "Subscriptions", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "Subscriptions", resource_id: 1 } })).to.be.greaterThan(0)
            const sub = await Subscription.findByPk(1, { user: SystemUser,  })
            await sub!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "Subscriptions", resource_id: 1 } })).to.equal(0)
        })

        it ("When a Site is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "DataSites", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "DataSites", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "DataSites", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "DataSites", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "DataSites", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "DataSites", resource_id: 1 } })).to.be.greaterThan(0)
            const rec = await DataSite.findByPk(1, { user: SystemUser,  })
            await rec!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "DataSites", resource_id: 1 } })).to.equal(0)
        })

        it ("When a UserGroup is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([

                // 2 records directly to the group
                { resource: "UserGroups", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "UserGroups", user_id: 3, action: "update", permission: true, resource_id: 1 },

                // 2 records to users in the group
                { resource: "Graphs", user_group_id: 1, action: "read"  , permission: true, resource_id: 1 },
                { resource: "Graphs", user_group_id: 1, action: "update", permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "UserGroups", resource_id: 1 } })).to.be.greaterThan(0)
            expect(await Permission.count({ where: { user_group_id: 1 } })).to.be.greaterThan(0)
            
            const rec = await UserGroup.findByPk(1, { user: SystemUser,  })
            
            await rec!.destroy({ user: SystemUser })
            
            expect(await Permission.count({ where: { resource: "UserGroups", resource_id: 1 } })).to.equal(0)
            expect(await Permission.count({ where: { user_group_id: 1 } })).to.equal(0)
        })

        it ("When a RequestGroup is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "SubscriptionGroups", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "SubscriptionGroups", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "SubscriptionGroups", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "SubscriptionGroups", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "SubscriptionGroups", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "SubscriptionGroups", resource_id: 1 } })).to.be.greaterThan(0)
            const rec = await RequestGroup.findByPk(1, { user: SystemUser,  })
            await rec!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "SubscriptionGroups", resource_id: 1 } })).to.equal(0)
        })

        it ("When a Tag is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "Tags", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "Tags", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "Tags", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "Tags", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "Tags", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "Tags", resource_id: 1 } })).to.be.greaterThan(0)
            const rec = await Tag.findByPk(1, { user: SystemUser,  })
            await rec!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "Tags", resource_id: 1 } })).to.equal(0)
        })

        it ("When a Tag is deleted, any associated permissions are also deleted", async () => {
            await Permission.bulkCreate([
                { resource: "StudyAreas", user_id: 3, action: "read"  , permission: true, resource_id: 1 },
                { resource: "StudyAreas", user_id: 3, action: "update", permission: true, resource_id: 1 },
                { resource: "StudyAreas", user_id: 3, action: "delete", permission: true, resource_id: 1 },
                // { resource: "StudyAreas", user_id: 3, action: "search", permission: true, resource_id: 1 },
                { resource: "StudyAreas", user_id: 3, action: "share" , permission: true, resource_id: 1 },
            ])

            expect(await Permission.count({ where: { resource: "StudyAreas", resource_id: 1 } })).to.be.greaterThan(0)
            const rec = await StudyArea.findByPk(1, { user: SystemUser,  })
            await rec!.destroy({ user: SystemUser })
            expect(await Permission.count({ where: { resource: "StudyAreas", resource_id: 1 } })).to.equal(0)
        })
    })
});
