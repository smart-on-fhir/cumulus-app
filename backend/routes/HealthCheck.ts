import express           from "express"
import { literal, Op }   from "sequelize"
import moment            from "moment"
import { route }         from "../lib/route"
import config            from "../config"
import View              from "../db/models/View"
import StudyArea         from "../db/models/StudyArea"
import SubscriptionGroup from "../db/models/SubscriptionGroup"
import Tag               from "../db/models/Tag"
import User              from "../db/models/User"
import Subscription      from "../db/models/Subscription"
import { tableExists }   from "../lib"


const STATUS_PASSED = "passed"
const STATUS_FAILED = "failed"
const STATUS_MIXED  = "mixed"

export const router = express.Router({ mergeParams: true });


route(router, {
    path  : "/",
    method: "get",
    async handler(req, res) {
        res.json([
            {
                name       : "Graph Descriptions",
                description: "Verify that all charts have descriptions",
                path       : "check-graph-descriptions"
            },
            {
                name       : "Graph Thumbnails",
                description: "Verify that all charts have a thumbnail screenshot",
                path       : "check-graph-thumbnails"
            },
            {
                name       : "Graph Titles",
                description: "Verify that all charts have a name other than 'Untitled Graph', not ending with '(copy)'",
                path       : "check-graph-titles"
            },
            {
                name       : "Graph Subscriptions",
                description: "Verify that all charts are connected to existing subscriptions",
                path       : "check-graph-subscriptions"
            },
            {
                name       : "Graph Subscription Data",
                description: "Verify that all charts are connected to existing subscriptions data source",
                path       : "check-subscriptions-data"
            },
            {
                name       : "Study Areas",
                description: "Verify that all Study Areas have associated Subscriptions",
                path       : "check-study-areas"
            },
            {
                name       : "Subscription Groups",
                description: "Verify that all Subscription Groups have associated Subscriptions",
                path       : "check-subscription-groups"
            },
            {
                name       : "Tag Descriptions",
                description: "Verify that all Tags have non-empty description",
                path       : "check-tag-descriptions"
            },
            {
                name       : "Expired User Invitations",
                description: "Look for users who did not activate their account and their activation code is expired",
                path       : "check-expired-users"
            },
            {
                name       : "Passive Users",
                description: "Look for users who have never logged in",
                path       : "check-passive-users"
            }
        ])
    }
})

route(router, {
    path  : "/check-graph-descriptions",
    method: "get",
    async handler(req, res) {

        const count = await View.count()

        if (!count) {
            return res.json({
                status : STATUS_MIXED,
                message: "No charts found"
            })
        }

        const rows = await View.findAll({
            where: {
                description: {
                    [Op.or]: ["", null]
                }
            },
            user: req.user
        })

        if (rows.length === count) {
            return res.json({
                status : STATUS_FAILED,
                message: "All charts charts don't have description"
            })
        }

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} of ${count} charts don't have description`,
                payload: rows.map(row => ({ text: row.name, to: "/views/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All charts have descriptions"
        })
    }
})

route(router, {
    path  : "/check-graph-thumbnails",
    method: "get",
    async handler(req, res) {
        const count = await View.count()

        if (!count) {
            return res.json({
                status : STATUS_MIXED,
                message: "No charts found"
            })
        }

        const rows = await View.findAll({
            where: {
                screenShot: null
            },
            user: req.user
        })

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} of ${count} charts don't have thumbnails`,
                payload: rows.map(row => ({ text: row.name, to: "/views/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All charts have thumbnails"
        })
    }
})

route(router, {
    path  : "/check-graph-titles",
    method: "get",
    async handler(req, res) {

        const count = await View.count()

        if (!count) {
            return res.json({
                status : STATUS_MIXED,
                message: "No charts found"
            })
        }

        const rows = await View.findAll({
            where: {
                name: {
                    [Op.or]: {
                        [Op.endsWith]: "(copy)",
                        [Op.eq]: "Untitled Graph"
                    }
                }
            },
            user: req.user
        })

        if (rows.length === count) {
            return res.json({
                status : STATUS_FAILED,
                message: "All charts charts don't have proper name"
            })
        }

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} of ${count} charts don't have proper name`,
                payload: rows.map(row => ({ text: row.name, to: "/views/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All charts have proper names"
        })
    }
})

route(router, {
    path  : "/check-graph-subscriptions",
    method: "get",
    async handler(req, res) {

        const count = await View.count()

        if (!count) {
            return res.json({
                status : STATUS_MIXED,
                message: "No charts found"
            })
        }

        const rows = await View.findAll({
            where: {
                subscriptionId: {
                    [Op.notIn]: literal('(SELECT "id" FROM "DataRequests")')
                }
            },
            user: req.user
        })

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} of ${count} charts are associated with missing subscription`,
                payload: rows.map(row => ({ text: row.name, to: "/views/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All charts are OK"
        })
    }
})

route(router, {
    path  : "/check-subscriptions-data",
    method: "get",
    async handler(req, res) {

        const subs = await Subscription.findAll({ where: { dataURL: null }, user: req.user })

        const bad: any[] = []
        
        for (const sub of subs) {
            const exists = await tableExists(Subscription.sequelize!, `subscription_data_${sub.id}`)
            if (!exists) {
                bad.push(sub)
            }
        }
            
        if (bad.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${bad.length} subscriptions have no associated data table`,
                payload: bad.map(row => ({ text: row.name, to: "/requests/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All subscriptions are OK"
        })
    }
})

route(router, {
    path  : "/check-study-areas",
    method: "get",
    async handler(req, res) {

        const projects = await StudyArea.findAll({ user: req.user })

        if (!projects.length) {
            return res.json({
                status : STATUS_MIXED,
                message: "No Study Areas found"
            })
        }

        let bad: any[] = []

        for (let project of projects) {
            // @ts-ignore
            const count = await project.countSubscriptions()
            if (count === 0) {
                bad.push(project)
            }
        }

        if (bad.length === projects.length) {
            return res.json({
                status : STATUS_FAILED,
                message: "All Study Areas do not have any subscriptions"
            })
        }

        if (bad.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${bad.length} of ${projects.length} Study Areas do not have any subscriptions`,
                payload: bad.map(row => ({ text: row.name, to: "/study-areas/" + row.id }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All Study Areas have subscriptions"
        })
    }
})

route(router, {
    path  : "/check-subscription-groups",
    method: "get",
    async handler(req, res) {

        const groups = await SubscriptionGroup.findAll({ user: req.user })

        if (!groups.length) {
            return res.json({
                status : STATUS_MIXED,
                message: "No Subscription Groups found"
            })
        }

        let bad: any[] = []

        for (let group of groups) {
            // @ts-ignore
            const count = await group.countRequests()
            if (count === 0) {
                bad.push(group)
            }
        }

        if (bad.length === groups.length) {
            return res.json({
                status : STATUS_FAILED,
                message: "All Subscription Groups do not have any subscriptions"
            })
        }

        if (bad.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${bad.length} of ${groups.length} Subscription Groups do not have any subscriptions`
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All Subscription Groups have subscriptions"
        })
    }
})

route(router, {
    path  : "/check-tag-descriptions",
    method: "get",
    async handler(req, res) {

        const count = await Tag.count()

        if (!count) {
            return res.json({
                status : STATUS_MIXED,
                message: "No Tags found"
            })
        }

        const rows = await Tag.findAll({
            where: { description: "" },
            user: req.user
        })

        if (rows.length === count) {
            return res.json({
                status : STATUS_FAILED,
                message: "All Tags have empty description"
            })
        }

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} of ${count} Tags have empty description`
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All Tags have descriptions"
        })
    }
})

route(router, {
    path  : "/check-expired-users",
    method: "get",
    async handler(req, res) {

        const rows = await User.findAll({
            where: {
                password: null,
                createdAt: {
                    [Op.lt]: moment().subtract(config.userInviteExpireAfterHours).toDate()
                }
            },
            user: req.user
        })

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} Users have expired invitations`,
                payload: rows.map(u => u.email)
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All Users are activated"
        })
    }
})

route(router, {
    path  : "/check-passive-users",
    method: "get",
    async handler(req, res) {

        const rows = await User.unscoped().findAll({
            where: {
                password : { [Op.not]: null },
                lastLogin: null
            },
            user: req.user
        })

        if (rows.length) {
            return res.json({
                status : STATUS_MIXED,
                message: `${rows.length} Users have never logged in`,
                payload: rows.map(u => ({ text: u.email }))
            })
        }

        res.json({
            status : STATUS_PASSED,
            message: "All Users are active"
        })
    }
})

