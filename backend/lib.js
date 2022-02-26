const Path            = require("path");
const { readdirSync, statSync } = require("fs");
const { Op }          = require("sequelize");

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
    /**
     * @type {any} //{import("sequelize").FindOptions}
     */
    const options = {
        where: {},
        attributes: {

            // Select all the attributes of the model, plus some additional ones.
            // Useful for aggregations, e.g.
            // { attributes: { include: [[sequelize.fn('COUNT', sequelize.col('id')), 'total']] }
            include: [],

            // Select all the attributes of the model, except some few.
            // Useful for security purposes e.g. { attributes: { exclude: ['password'] } }
            exclude: []
        },

        // A list of associations to eagerly load using a left join.
        // Supported is either
        // { include: [ Model1, Model2, ...]} or
        // { include: [{ model: Model1, as: 'Alias' }]} or
        // { include: ['Alias']}.
        // If your association are set up with an as (eg. X.hasMany(Y, { as: 'Z },
        // you need to specify Z in the as attribute when eager loading Y).
        include: []
    }

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
        // console.log(options.where)
    }

    // pick & omit -------------------------------------------------------------
    if (req.query.pick || req.query.omit) {
        
        /**
         * @type {import("sequelize").FindAttributeOptions}
         */
        const attributes = {
            include: []
        };

        if (req.query.pick) {
            attributes.include = String(req.query.pick).split(",")
        }
        if (req.query.omit) {
            attributes.exclude = String(req.query.omit).split(",")
        }

        options.attributes = attributes
    }

    // include -----------------------------------------------------------------
    if (req.query.include) { // table:col|col,table:col|col...
        String(req.query.include).split(",").forEach(x => {
            const include = {}
            let [association, alias, attrs] = x.split(":")
            include.association = association
            if (!attrs) {
                attrs = alias
            } else {
                include.as = alias
            }
            if (attrs) {
                include.attributes = attrs.split("|")
            }
            options.include.push(include)
        })
    }

    // order ------------------------------------------------------------------
    if (req.query.order) {
        options.order = [];
        String(req.query.order).split(",").forEach(x => {
            options.order.push(x.split(":"))
        });
    }

    // limit ------------------------------------------------------------------
    if (req.query.limit) {
        options.limit = uInt(req.query.limit)

        String(req.query.limit).split(",").forEach(x => {
            const tokens = x.trim().split(":")
            if (tokens.length === 1) {
                options.limit = uInt(tokens[0])
            }
            else if (tokens.length === 2) {
                const model = options.include.find(o => o.association === tokens[0])
                if (model) {
                    model.separate = true
                    model.limit = uInt(tokens[1])
                }
            }
        });
    }

    // offset -----------------------------------------------------------------
    if (req.query.offset) {
        options.offset = uInt(req.query.offset)
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

/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory
 * @param {RegExp|Function} [filter]
 * @returns {IterableIterator<String>}
 */
function* filterFiles(dir, filter) {
    const files = walkSync(dir);
    for (const file of files) {
        if (filter instanceof RegExp && !filter.test(file)) {
            continue;
        }
        if (typeof filter == "function" && !filter(file)) {
            continue;
        }
        yield file;
    }
}

/**
 * List all files in a directory recursively in a synchronous fashion.
 * @param {String} dir
 * @returns {IterableIterator<String>}
 */
function* walkSync(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
        const pathToFile = Path.join(dir, file);
        const isDirectory = statSync(pathToFile).isDirectory();
        if (isDirectory) {
            yield *walkSync(pathToFile);
        } else {
            yield pathToFile;
        }
    }
}

module.exports = {
    bool,
    uInt,
    rw,
    assert,
    walkSync,
    filterFiles,
    // wait,
    // getBaseUrl,
    // makeArray,
    getFindOptions
};
