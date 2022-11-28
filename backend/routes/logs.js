const express = require("express");
const moment  = require("moment");
const { requirePermissionMiddleware } = require("../acl");
const { combinedLogger }  = require("../logger");


const router = module.exports = express.Router({ mergeParams: true });

router.get("/",
    requirePermissionMiddleware("Logs.read"),
    (req, res, next) => {

    const levels = String(req.query.levels || "").trim().split(/\s*,\s*/).filter(Boolean);

    const tags = String(req.query.tags || "").trim().split(/\s*,\s*/).filter(Boolean);

    const limit = +(req.query.limit || "100")

    let from = moment(String(req.query.from || ""), "YYYY-MM-DD")
    if (!from.isValid()) {
        from = moment().subtract(1, "day")
    }

    let to = moment(String(req.query.to || ""), "YYYY-MM-DD")
    if (!to.isValid()) {
        to = moment()
    }

    const options = {
        from  : from.startOf("day").toDate(),
        until : to.endOf("day").toDate(),
        // limit : 500 ,
        // start : 0,
        order : 'desc',
        // fields: [],
    };

    // console.log(options)
    
    combinedLogger.query(options, (err, results) => {
        if (err) {
            return next(err);
        }

        let items = results.dailyRotateFile

        if (levels.length) {
            items = items.filter(item => levels.includes(item.level))
        }

        if (tags.length) {
            items = items.filter(item => item.tags && item.tags.some(t => tags.includes(t)))
        }

        items = items.splice(0, limit)

        res.json(items);
    });
})