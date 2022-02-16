const { Op } = require("sequelize");

const RE_FALSE = /^(0|no|false|off|null|undefined|NaN|)$/i;

// function wait(ms) {
//     return new Promise(resolve => {
//         setTimeout(resolve, ms);
//     });
// }

function bool(x) {
    return !RE_FALSE.test(String(x).trim());
}

function uInt(x, defaultValue = 0) {
    x = parseInt(x + "", 10);
    if (isNaN(x) || !isFinite(x) || x < 0) {
        x = uInt(defaultValue, 0);
    }
    return x;
}

// /**
//  * 
//  * @param {any} x 
//  * @returns any[]
//  */
// function makeArray(x) {
//     return Array.isArray(x) ? x : [x];
// }

// /**
//  * where=((b:5),(a:5|a:6))|(c:gt:8)
//  * @param {string} input 
//  */
// function parseWhere(input) {
//     let char, i = 0, len = input.length, ast = {
//         type: "root",
//         children: []
//     };

//     let current = ast;
    
//     while (i < len) {
//         char = input[i++];

//         switch (char) {
//             case "(":
//                 // block start
//                 break;
//             case ")":
//                 // block end
//                 break;
//             case ",":
//                 // AND
//                 break;
//             case "|":
//                 // OR
//                 break;
//             case ":":
//                 // Separator
//                 break;
//             default:
//                 // text
//                 break;
//         }
//     }
// }

// /**
//  * Given the current environment, this method must return the current url
//  * as URL instance. In Node we might be behind a proxy!
//  * @param {import("express").Request} req
//  * @returns {string}
//  */
// function getBaseUrl(req)
// {
//     let host = req.headers.host + "";
//     if (req.headers["x-forwarded-host"]) {
//         host = req.headers["x-forwarded-host"] + "";
//         if (req.headers["x-forwarded-port"]) {
//             host += ":" + req.headers["x-forwarded-port"];
//         }
//     }

//     const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
//     return protocol + "://" + host;
// }

/**
 * @param {import("express").Request} req
 * @returns {import("sequelize").FindOptions}
 */
function getFindOptions(req)
{
    const options = {}

    // where -------------------------------------------------------------------
    if (req.query.where) {
        const parts = String(req.query.where).split(":")
        if (parts.length === 2) {
            options.where = { [parts[0]]: parts[1] };
        }
        else if (parts.length === 3 && parts[1] in Op) {
            options.where = {
                [parts[0]]: {
                    [Op[parts[1]]]: parts[2]
                }
            };
        }
        console.log(options.where)
    }

    // pick & omit -------------------------------------------------------------
    if (req.query.pick || req.query.omit) {
        options.attributes = {}
        if (req.query.pick) {
            options.attributes.include = String(req.query.pick).split(",")
        }
        if (req.query.omit) {
            options.attributes.exclude = String(req.query.omit).split(",")
        }
    }

    // include -----------------------------------------------------------------
    if (req.query.include) { // table:col|col,table:col|col...
        options.include = []
        String(req.query.include).split(",").forEach(x => {
            const include = {}
            const [l, r] = x.split(":")
            include.association = l
            if (r) {
                include.attributes = r.split("|")
            }
            options.include.push(include)
        })
    }

    return options;
}

/**
 * Creates and returns a route-wrapper function that allows for using an async
 * route handlers without try/catch.
 * @param {import("express").RequestHandler} fn
 * @returns {(
 *   req: import("express").Request,
 *   res: import("express").Response,
 *   next: import("express").NextFunction
 * ) => Promise<void>}
 */
function rw(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * @param {any} condition 
 * @param {Error | string} error
 * @type {import("../index").app.assert}
 */
function assert(condition, error) {
    if (!(condition)) {
        throw error || "Assertion failed"
    }
}

module.exports = {
    bool,
    uInt,
    rw,
    assert,
    // wait,
    // getBaseUrl,
    // makeArray,
    getFindOptions
};
