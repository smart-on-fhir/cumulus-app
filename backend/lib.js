const Path                      = require("path");
const { readdirSync, statSync } = require("fs");
const { Op }                    = require("sequelize");
const { validationResult }      = require("express-validator");

const RE_FALSE = /^(0|no|false|off|null|undefined|NaN|)$/i;

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

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
 * @param {ErrorConstructor} ctor Error constructor
 * @type {import("../index").app.assert}
 */
function assert(condition, error, ctor = Error) {
    if (!(condition)) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new ctor(error || "Assertion failed")
        }
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

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param {string} line The line to parse
 * @param {string[]} [delimiters=[","]] The delimiter to use (defaults to ",")
 * @param {string} [stringDelimiter='"']
 * @returns {string[]} The cells as array of strings
 */
function parseDelimitedLine(line, delimiters = [","], stringDelimiter = '"')
{   
    /**
     * @type {string[]}
     */
    const out = [];
    
    const len = line.length;

    let idx    = 0,
        char   = "",
        expect = null,
        buffer = "";

    while (idx < len) {
        char = line[idx++];
        
        // String
        if (char === stringDelimiter) {

            // begin string
            if (!expect) {
                expect = char;
            }

            // Escaped quote - continue string
            else if (line[idx] === char) {
                buffer += char;
                idx++;
            }

            // Close string
            else {
                expect = null;
                out.push(buffer);
                buffer = "";
                idx++;
            }
        }

        // delimiter
        else if (delimiters.includes(char)) {
            if (!expect) {
                out.push(buffer);
                buffer = "";
            }
            else {
                buffer += char;
            }
        }

        // default
        else {
            buffer += char;
        }
    }

    if (buffer) {
        out.push(buffer);
        buffer = "";
    }

    if (expect) {
        throw new SyntaxError(`Syntax error - unterminated string. Expecting ${JSON.stringify(expect)}, line: ${line}`);
    }

    return out//.map(s => s.trim());
}

/**
 * 
 * @param {string}   input 
 * @param {object}   [options = {}]
 * @param {string[]} options.separators = [","]
 * @param {string}   options.stringDelimiter Defaults to '"'
 * @returns {import("../index").app.DataRequestData}
 */
function parseDelimitedString(input, options = {
    separators     : [","],
    stringDelimiter: '"'
}) {
    /**
     * @type {any[][]}
     */
    let rows = []

    /**
     * @type {import("../index").app.DataRequestDataColumn[]}
     */
    let cols = []
    
    /**
     * @type {string[]}
     */
    const unParsedRows = input.split("\n").map(s => s.trim()).filter(Boolean);
    
    const { separators, stringDelimiter } = options;
    
    if (unParsedRows.length > 1) {

        const headerRow = String(unParsedRows.shift());

        rows = unParsedRows.map(row => {
            if (separators.length) {
                return parseDelimitedLine(row, separators, stringDelimiter)
            }
            return [row]
        });

        cols = parseDelimitedLine(headerRow, separators, stringDelimiter).map(
            (col, i) => {
                if (col === "cnt") {
                    return {
                        name       : "cnt",
                        label      : "Count",
                        description: "Count",
                        dataType   : "integer"
                    }
                }

                const title = toTitleCase(col)
                return {
                    name       : col,
                    label      : title,
                    description: title.charAt(0) + title.substr(1).toLowerCase(),
                    dataType   : detectDataTypeAt(i, rows)
                }
            }
        );

        rows = rows.map(row => {
            cols.forEach((col, i) => {
                const type = col.dataType;
                
                let value = row[i];
                
                if (type === "integer") {
                    
                    /**
                     * @type {number|null}
                     */
                    value = parseInt(value, 10);
                    if (isNaN(value) || !isFinite(value)) {
                        value = null
                    }

                    row[i] = value
                }

                else if (type === "float") {
                    
                    /**
                     * @type {number|null}
                     */
                    value = parseFloat(value);
                    if (isNaN(value) || !isFinite(value)) {
                        value = null
                    }

                    row[i] = value
                }

                else if (!value) {
                    row[i] = null
                }
            })

            return row
        })
    }

    return {
        cols,
        rows
    }
}

/**
 * @param {string} str 
 * @returns {string}
 */
function toTitleCase(str) {
    return str.replace(/([A-Z])/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}

/**
 * 
 * @param {number} i 
 * @param {string[][]} rows 
 * @returns {string}
 */
function detectDataTypeAt(i, rows) {
    let type = "";

    for (let row of rows) {
        let col = String(row[i] || "").trim()
        let t = valueToDataType(col)

        if (t === "") {
            continue
        }

        if (type === "") {
            type = t
        }
        else {
            if (type && type !== t) {
                return "string"
            }
        }
    }

    return type || "hidden"
}

/**
 * Given a string representation of a value, parses it and returns the best
 * guess for its data type.
 * - If the value is empty returns ""
 * - If the value is number returns "integer" or "float"
 * - If the value starts with NNNN-NN-NN returns "date:YYYY-MM-DD" 
 * - If the value starts with NNNN-NN-01 returns "date:YYYY-MM" 
 * - If the value starts with NNNN-01-01 returns "date:YYYY" 
 * - Otherwise returns "string"
 * @param {string} x 
 * @returns {""|"integer"|"float"|"string"|"date:YYYY-MM-DD"|"date:YYYY-MM"|"date:YYYY"}
 */
function valueToDataType(x) {
    if (!x) {
        return ""
    }
    if ((/^-?[0-9]+$/).test(x)) {
        return "integer"
    }
    if ((/^-?[0-9]*\.[0-9]+$/).test(x)) {
        return "float"
    }
    if ((/^\d{4}-01-01/).test(x)) {
        return "date:YYYY"
    }
    if ((/^\d{4}-\d{2}-01/).test(x)) {
        return "date:YYYY-MM"
    }
    if ((/^\d{4}-\d{2}-\d{2}/).test(x)) {
        return "date:YYYY-MM-DD"
    }
    return "string"
}

/**
 * Rounds the given number @n using the specified precision.
 * @param {number | string} n
 * @param {number} [precision]
 */
function roundToPrecision(n, precision) {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        n = Math.round( n );
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round( n * q ) / q;
    }

    return n;
}

/**
 * Given a request object, returns its base URL
 * @param {import("express").Request} req
 */
function getRequestBaseURL(req) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    return protocol + "://" + host;
}

/**
 * @param {import("sequelize").Sequelize} connection
 * @param {string} tableName
 * @param {string} incrementColumnName
 */
async function fixAutoIncrement(connection, tableName, incrementColumnName) {
    await connection.query(
        `select setval(
            '"${tableName}_${incrementColumnName}_seq"',
            (select max("${incrementColumnName}") from "${tableName}"),
            true
        )`
    );
}

function validateRequest(...validations) {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
            // Build your resulting errors however you want! String, object, whatever - it works!
            return `${param}: ${msg}`;
        });

        if (errors.isEmpty()) {
            return next()
        }

        res.status(400).json({ errors: errors.array() });
    };
}

module.exports = {
    bool,
    uInt,
    rw,
    assert,
    walkSync,
    filterFiles,
    wait,
    parseDelimitedString,
    parseDelimitedLine,
    toTitleCase,
    getFindOptions,
    roundToPrecision,
    getRequestBaseURL,
    fixAutoIncrement,
    validateRequest
};
