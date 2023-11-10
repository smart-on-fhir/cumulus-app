import { expect } from "chai"
import User       from "../../backend/db/models/User";


describe("Permissions", () => {
    it ("User.getPermissions", async () => {
        const user = await User.findByPk(5, { user: { role: "system" }})
        const permissions = await user.getPermissions()

        // Explicit permissions --------------------------------------------

        // Graph#1 has been shared with User#3
        expect(permissions["Graphs#1.read"]).to.equal(true)
        expect(permissions["Graphs#1.update"]).to.equal(true)
        expect(permissions["Graphs#1.delete"]).to.equal(true)

        // User#3 can read any Graph
        expect(permissions["Graphs.read"]).to.equal(true)

        // Dynamic permissions ---------------------------------------------
        // TODO: Users can edit themselves

        // Role permissions ------------------------------------------------
        expect(permissions["SubscriptionGroups.read"]).to.equal(true)
        expect(permissions["Subscriptions.read"]).to.equal(true)
        expect(permissions["Subscriptions.refresh"]).to.equal(true)
        expect(permissions["Subscriptions.requestLineLevelData"]).to.equal(true)
        expect(permissions["DataSites.read"]).to.equal(true)
        expect(permissions["StudyAreas.read"]).to.equal(true)
        expect(permissions["Tags.read"]).to.equal(true)
        expect(permissions["SubscriptionTags.read"]).to.equal(true)
        expect(permissions["GraphTags.read"]).to.equal(true)
        expect(permissions["StudyAreaSubscriptions.read"]).to.equal(true)
    })
})
