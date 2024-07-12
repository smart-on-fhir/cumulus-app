import { Request, RequestHandler } from "express"
import {
    FindAttributeOptions,
    FindOptions,
    Op,
    Order,
    Sequelize,
    IncludeOptions
} from "sequelize"


const RE_FALSE = /^(0|no|false|off|null|undefined|NaN|none|)$/i;

export function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function bool(x: any) {
    return !RE_FALSE.test(String(x).trim());
}

export function uInt(x: any, defaultValue = 0) {
    x = parseInt(x + "", 10);
    if (isNaN(x) || !isFinite(x) || x < 0) {
        x = uInt(defaultValue, 0);
    }
    return x;
}

export function getFindOptions(req: Request): FindOptions
{
    const options: FindOptions = {
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
        String(req.query.where).split(",").forEach(x => {
            const parts = x.split(":")
            const parse = (x: string) => {
                try {
                    return JSON.parse(x)
                } catch {
                    return x
                }
            }
            if (parts.length === 2) {
                (options.where as any)![parts[0]] = parse(parts[1]);
            }
            else if (parts.length === 3 && parts[1] in Op) {
                (options.where as any)![parts[0]] = {
                    // @ts-ignore
                    [Op[parts[1]]]: parse(parts[2])
                };
            }
        })
    }


    // attributes | pick & omit ------------------------------------------------
    if (req.query.attributes) {
        options.attributes = String(req.query.attributes).split(",")
    }
    else if (req.query.pick || req.query.omit) {
        
        const attributes: FindAttributeOptions = {
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
            const include: IncludeOptions = {}
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
            (options.include as IncludeOptions[]).push(include)
        })
    }

    // order ------------------------------------------------------------------
    if (req.query.order) {
        options.order = [];
        String(req.query.order).split(",").forEach(x => {
            (options.order! as Order[]).push(x.split(":"))
        });
    }

    // limit ------------------------------------------------------------------
    if (req.query.limit) {
        String(req.query.limit).split(",").forEach(x => {
            const tokens = x.trim().split(":")
            if (tokens.length === 1) {
                const limit = uInt(tokens[0])
                if (limit > 0) {
                    options.limit = limit
                }
            }
            else if (tokens.length === 2) {
                const limit = uInt(tokens[1])
                if (limit > 0) {
                    const model = (options.include as IncludeOptions[]).find(o => o.association === tokens[0])
                    if (model) {
                        model.separate = true
                        model.limit = limit
                    }
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
 */
export function rw(fn: RequestHandler): RequestHandler {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function assert(condition: any, error?: string | ErrorConstructor, ctor = Error): asserts condition {
    if (!(condition)) {
        if (typeof error === "function") {
            throw new error()
        }
        else {
            throw new ctor(error || "Assertion failed")
        }
    }
}

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param line The line to parse
 * @param [delimiters=[","]] The delimiter to use (defaults to ",")
 * @param [stringDelimiter='"']
 * @returns The cells as array of strings
 */
export function parseDelimitedLine(line: string, delimiters: string[] = [","], stringDelimiter: string = '"'): (string | EmptyString)[]
{   
    const out: (string | EmptyString)[] = [];
    
    const len = line.length;

    let idx    = 0,
        char   = "",
        expect: string | null = null,
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
                out.push(buffer || new EmptyString());
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

export class EmptyString extends String {
    constructor(arg?: any) {
        super("")
    }
}

export function toTitleCase(str: string | String) {
    return str.replace(/([A-Z])/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}

/**
 * Rounds the given number @n using the specified precision.
 */
export function roundToPrecision(n: string | number, precision?: number) {
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
 */
export function getRequestBaseURL(req: Request) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    return protocol + "://" + host;
}

export async function fixAutoIncrement(connection: Sequelize, tableName: string, incrementColumnName: string) {
    await connection.query(
        `select setval(
            '"${tableName}_${incrementColumnName}_seq"',
            (select max("${incrementColumnName}") from "${tableName}"),
            true
        )`
    );
}

export function buildPermissionId({
    resource,
    resource_id,
    attribute,
    action
}: {
    resource     : string
    action       : string
    resource_id ?: number | null
    attribute   ?: string | null
    [key: string]: any
}) {
    let key = resource
    if (resource_id) {
        key += "#" + resource_id
    }
    if (attribute) {
        key += "." + attribute
    }
    key += "." + action
    return key
}

export function explode(input: Record<string, any>[], keys?: string[]): any {
    keys = keys || Object.keys(input[0])
    const key: any = keys.pop()
    let out: any[] = []
    for (const rec of input) {
        if (Array.isArray(rec[key])) {
            out.push(...rec[key].map((v: any) => ({ ...rec, [key]: v })))
        } else {
            out.push(rec)
        }
    }
    if (keys.length) {
        return explode(out, keys)
    }
    return out
}

export function parseDbUrl(url: string) {
    // postgres://user:pass@host:port/database?query
    const match = url.match(/^(.*?):\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*?)(\?.*)?$/) || [];
    const out = {
        dialect : match[1],
        username: match[2],
        password: match[3],
        host    : match[4],
        port    : match[5],
        database: match[6],
        query   : {} as Record<string, string>
    };
    new URLSearchParams(match[7] || "").forEach((value, key) => {
        out.query[key] = value
    });
    return out
}
