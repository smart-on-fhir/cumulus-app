const { Op } = require("sequelize")
const RequestGroupModel = require("../db/models/RequestGroup");
const RequestModel      = require("../db/models/DataRequest");
const createRestRouter  = require("./BaseController");
const { rw }            = require("../lib");

const router = module.exports = createRestRouter(RequestGroupModel);

// "/api/request-groups?include=requests:id|name|description|refresh|completed&order=name:asc&limit=4,requests:3"
router.get("/group-by/requests", rw(async (req, res) => {

    let [groups, requests, orphans] = await Promise.all([
        RequestGroupModel.findAll({
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            },
            order: [["createdAt", "desc"], ["name", "asc"]],
            limit: 3
        }),
        RequestModel.findAll({
            attributes: {
                exclude: ["data", "requestedData", "createdAt", "updatedAt"]
            },
            order: [["name", "asc"]],
            // limit: 3,
            where: {
                groupId: {
                    [Op.not]: null
                }
            }
        }),
        RequestModel.findAll({
            attributes: {
                exclude: ["data", "requestedData", "createdAt", "updatedAt"],
            },
            limit: 3,
            where: {
                groupId: {
                    [Op.is]: null
                }
            }
        })
    ]);

    requests = requests.map(x => x.toJSON())

    const out = groups.map(group => {
        return {
            ...group.toJSON(),
            requests: requests.filter(r => r.groupId === group.id)
        };
    });

    out.push({
        description: "The default group",
        name: "GENERAL",
        requests: orphans.map(r => r.toJSON())
    });

    res.json(out)
}));
