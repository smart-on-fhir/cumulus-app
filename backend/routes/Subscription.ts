import crypto                                                   from "crypto"
import express, { Response }                                    from "express"
import slug                                                     from "slug"
import { Includeable, QueryTypes }                              from "sequelize"
import { NotFound, InternalServerError, HttpError, BadRequest } from "../errors"
import Model                                                    from "../db/models/Subscription"
import { AppRequest }                                           from "../types"
import { route }                                                from "../lib/route"
import GroupModel                                               from "../db/models/SubscriptionGroup"
import { requestPermission }                                    from "../services/acl"
import ViewModel                                                from "../db/models/View"
import ColumnsMetadata                                          from "../cumulus_library_columns.json"
import { sql as logSql }                                        from "../services/logger"
import ImportJob                                                from "../DataManager/ImportJob"
import { getFindOptions, assert, rw, uInt, bool, cached }       from "../lib"
import { version as pkgVersion }                                from "../../package.json"
import { DATA_TYPES }                                           from "../DataManager/dataTypes"
import config                                                   from "../config"


export const router = express.Router({ mergeParams: true });

export default router

const FilterConfig: Record<string, (col: string) => string> = {
    
    // Text -------------------------------------------------------------------
    strEq             : col => `"${col}"::TEXT LIKE ?`,
    strContains       : col => `"${col}"::TEXT LIKE concat('%', ?, '%')`,
    strStartsWith     : col => `"${col}"::TEXT LIKE concat(?, '%')`,
    strEndsWith       : col => `"${col}"::TEXT LIKE concat('%', ?)`,
    matches           : col => `"${col}"::TEXT ~ ?`, 
    strEqCI           : col => `"${col}"::TEXT ILIKE ?`,
    strContainsCI     : col => `"${col}"::TEXT ILIKE concat('%', ?, '%')`,
    strStartsWithCI   : col => `"${col}"::TEXT ILIKE concat(?, '%')`,
    strEndsWithCI     : col => `"${col}"::TEXT ILIKE concat('%', ?)`,
    matchesCI         : col => `"${col}"::TEXT ~* ?`,
    strNotEq          : col => `"${col}"::TEXT NOT LIKE ?`,
    strNotContains    : col => `"${col}"::TEXT NOT LIKE concat('%', ?, '%')`,
    strNotStartsWith  : col => `"${col}"::TEXT NOT LIKE concat(?, '%')`,
    strNotEndsWith    : col => `"${col}"::TEXT NOT LIKE concat('%', ?)`,
    notMatches        : col => `"${col}"::TEXT !~ ?`, 
    strNotEqCI        : col => `"${col}"::TEXT NOT ILIKE ?`,
    strNotContainsCI  : col => `"${col}"::TEXT NOT ILIKE concat('%', ?, '%')`,
    strNotStartsWithCI: col => `"${col}"::TEXT NOT ILIKE concat(?, '%')`,
    strNotEndsWithCI  : col => `"${col}"::TEXT NOT ILIKE concat('%', ?)`,
    notMatchesCI      : col => `"${col}"::TEXT !~* ?`,
    
    // Dates ------------------------------------------------------------------
    sameDay           : col => `date_trunc('day'  , "${col}"::TIMESTAMP) =  date_trunc('day'  , TIMESTAMP ?)`,
    sameWeek          : col => `date_trunc('week' , "${col}"::TIMESTAMP) =  date_trunc('week' , TIMESTAMP ?)`,
    sameMonth         : col => `date_trunc('month', "${col}"::TIMESTAMP) =  date_trunc('month', TIMESTAMP ?)`,
    sameYear          : col => `date_trunc('year' , "${col}"::TIMESTAMP) =  date_trunc('year' , TIMESTAMP ?)`,
    sameDayOrBefore   : col => `date_trunc('day'  , "${col}"::TIMESTAMP) <= date_trunc('day'  , TIMESTAMP ?)`,
    sameWeekOrBefore  : col => `date_trunc('week' , "${col}"::TIMESTAMP) <= date_trunc('week' , TIMESTAMP ?)`,
    sameMonthOrBefore : col => `date_trunc('month', "${col}"::TIMESTAMP) <= date_trunc('month', TIMESTAMP ?)`,
    sameYearOrBefore  : col => `date_trunc('year' , "${col}"::TIMESTAMP) <= date_trunc('year' , TIMESTAMP ?)`,
    sameDayOrAfter    : col => `date_trunc('day'  , "${col}"::TIMESTAMP) >= date_trunc('day'  , TIMESTAMP ?)`,
    sameWeekOrAfter   : col => `date_trunc('week' , "${col}"::TIMESTAMP) >= date_trunc('week' , TIMESTAMP ?)`,
    sameMonthOrAfter  : col => `date_trunc('month', "${col}"::TIMESTAMP) >= date_trunc('month', TIMESTAMP ?)`,
    sameYearOrAfter   : col => `date_trunc('year' , "${col}"::TIMESTAMP) >= date_trunc('year' , TIMESTAMP ?)`,
    beforeDay         : col => `date_trunc('day'  , "${col}"::TIMESTAMP) <  date_trunc('day'  , TIMESTAMP ?)`,
    beforeWeek        : col => `date_trunc('week' , "${col}"::TIMESTAMP) <  date_trunc('week' , TIMESTAMP ?)`,
    beforeMonth       : col => `date_trunc('month', "${col}"::TIMESTAMP) <  date_trunc('month', TIMESTAMP ?)`,
    beforeYear        : col => `date_trunc('year' , "${col}"::TIMESTAMP) <  date_trunc('year' , TIMESTAMP ?)`,
    afterDay          : col => `date_trunc('day'  , "${col}"::TIMESTAMP) >  date_trunc('day'  , TIMESTAMP ?)`,
    afterWeek         : col => `date_trunc('week' , "${col}"::TIMESTAMP) >  date_trunc('week' , TIMESTAMP ?)`,
    afterMonth        : col => `date_trunc('month', "${col}"::TIMESTAMP) >  date_trunc('month', TIMESTAMP ?)`,
    afterYear         : col => `date_trunc('year' , "${col}"::TIMESTAMP) >  date_trunc('year' , TIMESTAMP ?)`,

    // Booleans ---------------------------------------------------------------
    isTrue            : col => `"${col}"::BOOLEAN IS TRUE`,
    isNotTrue         : col => `"${col}"::BOOLEAN IS NOT TRUE`,
    isFalse           : col => `"${col}"::BOOLEAN IS FALSE`,
    isNotFalse        : col => `"${col}"::BOOLEAN IS NOT FALSE`,

    // Numbers ----------------------------------------------------------------
    eq                : col => `"${col}"::NUMERIC  = ?` ,
    ne                : col => `"${col}"::NUMERIC != ?`,
    gt                : col => `"${col}"::NUMERIC  > ?` ,
    gte               : col => `"${col}"::NUMERIC >= ?`,
    lt                : col => `"${col}"::NUMERIC  < ?` ,
    lte               : col => `"${col}"::NUMERIC <= ?`,

    // Any --------------------------------------------------------------------
    isNull            : col => `"${col}" IS NULL`,
    isNotNull         : col => `"${col}" IS NOT NULL`,

    // isNull            : col => `"${col}"  = 'cumulus__null'`,
    // isNotNull         : col => `"${col}" != 'cumulus__null'`,
};

const filtersWithoutParams = [
    "isTrue",
    "isNotTrue",
    "isFalse",
    "isNotFalse",
    "isNull",
    "isNotNull"
];


// Views -----------------------------------------------------------------------
router.get("/:id/views", rw(async (req: AppRequest, res: Response) => {
    const options = getFindOptions(req);
    const views = await ViewModel.scope({ method: ['visible', req.user] }).findAll({
        ...options,
        where: { subscriptionId: +req.params.id },
        user: req.user,
    });
    res.json(views);
}));

// Export Data endpoint --------------------------------------------------------
router.get("/:id/data", rw(async (req: AppRequest, res: Response) => {
    requestPermission({ user: req.user, resource: "Subscriptions", action: "export" })
    const model = await Model.findByPk(req.params.id, { ...getFindOptions(req), user: req.user })
    assert(model, "Model not found", NotFound)
    assert(model.metadata, "Subscription data not found", NotFound)
    const table = "subscription_data_" + req.params.id

    const fileName = model.get("name")
    
    const cols = model.metadata.cols;

    // format ------------------------------------------------------------------
    const format = String(req.query.format || "csv");
    if (!["csv","tsv"].includes(format)) {
        throw new BadRequest(`Unsupported format "${format}"`);
    }

    // Reply inline or download a file -----------------------------------------
    if (req.query.inline) {
        res.type("text/plain")
    } else {
        res.setHeader("Content-disposition", `attachment; filename=${slug(fileName)}.${format}`);
        res.type(format)
    }
    
    // cols --------------------------------------------------------------------
    let colNames = String(req.query.cols || "").split(",").map(s => s.trim()).filter(Boolean);
    if (!colNames.length) {
        colNames = cols.map(c => c.name + "");
    } else {
        colNames = colNames.filter(x => cols.find(c => c.name === x));
    }

    res.status(200);

    const delimiter = format === "tsv" ? "\t" : ",";

    // Header ------------------------------------------------------------------
    res.write(colNames.join(delimiter));

    
    const countRow = await model.sequelize.query<any>(`SELECT COUNT(*) as "cnt" FROM "${table}"`, { type: QueryTypes.SELECT });
    const total = +countRow[0].cnt
    const limit = 1000
    // Rows --------------------------------------------------------------------


    async function loop(offset = 0) {

        const data = await model!.sequelize.query<any>(
            `SELECT * FROM ${table} OFFSET ${offset} LIMIT ${limit}`,
            { type: QueryTypes.SELECT }
        );

        data.forEach(row => {
            res.write(
                "\n" + colNames.map(name => row[name] === null ? "" : JSON.stringify(row[name])).join(delimiter)
            )
        });


        if (offset + limit < total) {
            await loop(offset + limit)
        } else {
            res.end()
        }
    }
    loop()

}));

// By Group --------------------------------------------------------------------
route(router, {
    method: "get",
    path: "/by-group",
    request: {
        schema: {
            groupLimit: {
                in: ["query"],
                optional: true,
                toInt: true,
                isInt: {
                    options: {
                        min: 2
                    }
                }
            },
            requestLimit: {
                in: ["query"],
                optional: true,
                toInt: true,
                isInt: {
                    options: {
                        min: 1
                    }
                }
            }
        }
    },
    async handler(req, res) {
    
        const groupLimit   = uInt(req.query.groupLimit); // >= 2!
        const requestLimit = uInt(req.query.requestLimit);

        const recs = await GroupModel.findAll({
            attributes: ["id", "name", "description", "createdAt"],
            include: {
                association: "requests",
                attributes : [
                    "id",
                    "name",
                    "description",
                    "refresh",
                    "completed",
                    "dataURL",
                    "metadata",
                    
                    // Subquery to count graphs for each request
                    [
                        GroupModel.sequelize!.literal(`(
                            SELECT COUNT(*)::int
                            FROM "Views" AS "graphs"
                            WHERE "graphs"."subscriptionId" = "requests"."id"
                        )`),
                        "graphCount"
                    ]
                ],
                right: true
            },
            order: [["name", "asc"], [GroupModel.sequelize!.literal('"requests.name"'), "asc"]],
            limit: groupLimit ? Math.max(groupLimit, 2) : undefined,
            user: req.user
        });
        
        res.json(recs.map(rec => {
            const out: any = rec.toJSON();
            if (requestLimit > 0) {
                out.requests = out.requests.slice(0, requestLimit)
            }
            if (out.id === null) {
                out.name = "GENERAL"
                out.description = "Contains requests that are not assigned to any specific group"
            }
            return out
        }));
    }
});

// Import Data endpoint --------------------------------------------------------
/**
 * Create (or update?) data by uploading a CSV file in a streaming fashion
 * CURL example:
 * ```sh
 * curl -i -X PUT "http://localhost:4000/api/data/bigdata?types=day,string,string,string,string,integer,integer" --data-binary @./big-data.csv
 * ```
 */
router.put(
    "/:id/data",
    express.raw({ limit: "100MB" }),
    rw(async (req: AppRequest, res: Response) => {
        const jobId = String(req.headers["x-job-id"] || "");
        
        // if job is passed in - continue
        if (jobId) {
            const job = ImportJob.find(jobId);
            if (!job) {
                throw new Error(`No such job "${jobId}"`)
            }
            await job.handle(req, res);
        }

        // else use a single-run job
        else {
            const job = await ImportJob.create();
            await job.handle(req, res);
        }
    })
);

// Data API endpoint -----------------------------------------------------------
router.get("/:id/api", rw(async (req: AppRequest, res: Response) => {

    const subscription = await Model.findByPk(req.params.id, { user: req.user })

    assert(subscription, "Subscription not found", NotFound)
    assert(subscription.metadata, "Subscription data not found", NotFound)

    // Aggregator --------------------------------------------------------------
    const packageId = subscription.dataURL
    if (packageId) {
        const { enabled, apiKey, baseUrl } = config.aggregator

        if (!enabled || !apiKey || !baseUrl) {
            throw new BadRequest("The aggregator API is not enabled")
        }

        // Cached for 2 hours
        if (cached(req, res, 7_200)) {
            return;
        }

        const url = new URL(`/data-packages/${packageId}/chart`, baseUrl);
        for (const [name, value] of Object.entries(req.query)) {
            url.searchParams.set(name, value + "")
        }

        try {
            var response = await fetch(url, {
                headers: {
                    "x-api-key": apiKey,
                    "accept"   : "application/json"
                },

            })
        } catch (ex) {
            console.error("====>", ex)
            throw ex
        }

        let type = response.headers.get("Content-Type") + "";

        let body = await response.text();

        if (body.length && type.match(/\bjson\b/i)) {
            body = JSON.parse(body);
        }

        if (!response.ok) {
            // @ts-ignore
            throw new HttpError(response.status, "Aggregator: " + (body?.message || body || response.statusText))
        }

        // console.log("%s ====> %s", url, body)
        
        return res.json(body)
    }
    // -------------------------------------------------------------------------

    const table = "subscription_data_" + req.params.id

    const column = String(req.query.column || "")

    const stratifier = String(req.query.stratifier || "")

    const filtersParams = (Array.isArray(req.query.filter) ?
        req.query.filter :
        [req.query.filter || ""]).map(String).filter(Boolean)

    // Cached for 1 year unless subscription.completed changes
    if (cached(req, res, 31_536_000, [subscription.completed + ""])) {
        return;
    }

    const allColumns = subscription.metadata.cols;

    // Verify that at least one column is requested
    if (!column) throw new BadRequest(`No column requested`)

    // Verify that column is not "cnt"
    if (column === "cnt") throw new BadRequest(`Must select a column other than "cnt"`)

    const columnMeta = allColumns.find(x => x.name === column)

    // Verify that column exists
    if (!columnMeta) throw new BadRequest(`No such column "${column}"`)

    // Verify that stratifier exists
    if (stratifier && !allColumns.find(c => c.name === stratifier)) {
        throw new BadRequest(`No such column "${stratifier}" (used as stratifier)`)
    }

    const hasErrorBars = allColumns.find(x => x.name === "cnt_min") && allColumns.find(x => x.name === "cnt_max");

    // Replacement values for the SQL query
    const replacements: any[] = [];

    // Filters ----------------------------------------------------------------
    //  OR: filter=gender:eq:male,age:gt:3
    // AND: filter=gender:eq:male&filter=age:gt:3
    // MIX: filter=gender:eq:male,age:gt:3&filter=year:gt:2022
    // ------------------------------------------------------------------------
    const filterConditions: any[] = [];

    filtersParams.forEach(f => {
        f.split(/\s*,\s*/).filter(Boolean).forEach((cond, i) => {
            const parts = cond.split(":");
            if (parts.length < 2) {
                throw new BadRequest("Each filter must have at least 2 parts");
            }
            
            const [column, operator, right] = parts;

            if (!right && !filtersWithoutParams.includes(operator)) {
                throw new BadRequest(`Missing filter value for "${cond}"`);
            }
            
            if (typeof FilterConfig[operator] !== "function") {
                throw new BadRequest(`Filter operator "${operator}" is not implemented`);
            }

            const sql = FilterConfig[operator](column)

            filterConditions.push({
                column,
                
                // If i === 0, then this is the first filter in an OR chain,
                // but it means that entire chain must be joined using "AND"
                // to any previous filters
                join: i ? "OR" : "AND",

                sql
            });

            if (right && sql.includes("?")) {
                replacements.push(right)
            }
        });
    });

    const filterWhere = filterConditions.reduce((prev, cur) => {
        if (cur.join !== prev.join) {
            return {
                sql: prev.sql ? `(${prev.sql}) ${cur.join} ${cur.sql}` : cur.sql,
                join: cur.join
            }
        }
        return { sql: `${prev.sql} ${cur.join} ${cur.sql}`, join: cur.join }
    }, { sql: "", join: "" }).sql;

    // Find which of the columns are already used -----------------------------
    const unusedColumns = allColumns.filter(c => {
        
        // The "cnt" is always used
        if (c.name === "cnt") return false
        if (c.name === "cnt_min") return false
        if (c.name === "cnt_max") return false

        // The selected column is used
        if (c.name === column) return false

        // The stratifier is used
        if (stratifier && c.name === stratifier) return false

        // Columns used by filters
        if (filterConditions.some(f => f.column === c.name)) return false

        return true
    });

    // ========================================================================
    // BUILD SQL
    // ========================================================================
    function where() {
        let out: string[] = []
        if (stratifier) out.push(`"${stratifier}" IS NOT NULL`)
        out.push(`"${column}" IS NOT NULL`)
        if (unusedColumns.length) {
            out.push(...unusedColumns.map(c => `"${c.name}" IS NULL`))
        }
        return out
    }

    let sql = `SELECT `

    // Select the stratifier if any
    if (stratifier) sql += `"${stratifier}" as stratifier, `

    // Select the column as "x"
    sql += columnMeta!.dataType === "integer" || columnMeta!.dataType === "float" ?
        `"${column}"::NUMERIC AS x` :
        `"${column}" AS x`

    // Select the count as "y"
    sql += `, sum(cnt::float) AS y `

    if (hasErrorBars) {
        sql += `, sum(cnt_min::float) AS y_min, sum(cnt_max::float) AS y_max `
    }

    sql += `FROM "${table}" `

    // The column must not be null
    sql += `WHERE ${where().join(" AND ")} `
    
    // Filters
    if (filterWhere) sql += `AND (${ filterWhere }) `

    if (stratifier) sql += `GROUP BY "${stratifier}", "${column}" `
    else sql += `GROUP BY "${column}" `
    
    // order by stratifier asc, column asc
    if (stratifier) sql += `ORDER BY stratifier, x`
    else sql += `ORDER BY x`


    function compileCountSQL(stratifier: string) {
        let sql = `SELECT `;
        
        sql += columnMeta!.dataType === "integer" || columnMeta!.dataType === "float" ?
            `"${column}"::NUMERIC AS stratifier` :
            `"${column}" AS stratifier`
        
        sql += `, sum(cnt::float) AS total FROM "${table}"`

        let where: string[] = [ `"${stratifier}" IS NULL` ]

        if (unusedColumns.length) {
            where.push(...unusedColumns.map(c => `"${c.name}" IS NULL`))
        }
        
        if (filterWhere) {
            where.push(`(${ filterWhere })`)
        }

        sql += ` WHERE ${where.join(" AND ")}`
        sql += ` GROUP BY stratifier`
        sql += ` ORDER BY stratifier`
        
        return sql
    }

    // console.log(sql)
    
    // Execute the query
    try {
        var result = await subscription.sequelize.query<any>(sql, {
            replacements,
            logging: logSql,
            type: QueryTypes.SELECT
        });
    } catch (ex) {
        throw new BadRequest(ex as Error)
    }

    // Do some post-processing
    let data: any[] = [];
    let group: any;
    let counts: any;

    if (stratifier) {
        counts = {}
        let countSql = compileCountSQL(stratifier)
        // console.log(countSql)
        const totals = await subscription.sequelize.query<any>(countSql, {
            replacements,
            logging: logSql,
            type: QueryTypes.SELECT
        });

        totals.forEach(row => counts[DATA_TYPES[columnMeta.dataType].get(row.stratifier)] = row.total)
    }

    result.forEach(row => {
        if (!group || group.stratifier !== row.stratifier) {
            group = {
                stratifier: row.stratifier,
                rows: []
            };
            data.push(group)
        }
        group.rows.push(hasErrorBars ?
            [
                DATA_TYPES[columnMeta.dataType].get(row.x),
                row.y,
                row.y_min,
                row.y_max
            ] :
            [
                DATA_TYPES[columnMeta.dataType].get(row.x),
                row.y
            ]
        )
    })

    res.json({
        column,
        stratifier: stratifier || undefined,
        filters   : filtersParams,
        totalCount: subscription.metadata.total,
        rowCount  : result.length,
        counts,
        data
    });
}));

router.get("/:id/raw-data", rw(async (req: AppRequest, res: Response) => {

    const subscription = await Model.findByPk(req.params.id, { user: req.user })

    assert(subscription, "Subscription not found", NotFound)
    assert(subscription.metadata, "Subscription data not found", NotFound)

    const table = "subscription_data_" + req.params.id

    const cacheKey = crypto.createHash("sha1").update([
        table,
        subscription.completed + "",
        pkgVersion
    ].join("-")).digest("hex");

    res.setHeader('Cache-Control', `max-age=31536000, no-cache`)
    res.setHeader('Vary', 'Origin, ETag')
    res.setHeader('ETag', cacheKey)

    let ifNoneMatchValue = req.headers['if-none-match']
    if (ifNoneMatchValue && ifNoneMatchValue === cacheKey) {
        res.statusCode = 304
        return res.end()
    }

    // Execute the query
    const result = await subscription.sequelize.query<any>(`SELECT * FROM "${table}"`, {
        logging: logSql,
        type: QueryTypes.SELECT
    });

    res.json(result.map(row => {
        for (let key in row) {
            const col = subscription.metadata!.cols.find(c => c.name === key) 
            switch (col?.dataType) {
                case "float":
                    row[key] = parseFloat(row[key])
                break;
                case "integer":
                    row[key] = parseInt(row[key], 10)
                break;
                case "boolean":
                    row[key] = bool(row[key])
                break;
            }
        }
        return row
    }));
}));

// Get all ---------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        res.json(await Model.findAll({ ...getFindOptions(req), user: req.user }));
    }
})

// Delete one ------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "delete",
    request: {
        schema: {
            id: {
                in: 'params',
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
});

// Get single subscription -----------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
    request: {
        schema: {
            id: {
                in: ["params"],
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true
            },

            // If set include the group id, name and description
            group: {
                in: ["query"],
                optional: true,
                isBoolean: true
            },

            // If set include related tags with id, name and description
            tags: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include related Views
            graphs: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include related StudyAreas
            study_areas: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {

        const include: Includeable[] = []

        if (req.query.group) {
            include.push({ association: "group", attributes: ["id", "name", "description"] })
        }

        if (req.query.tags) {
            include.push({ association: "Tags", attributes: ["id", "name", "description"] })
        }

        if (req.query.graphs) {
            include.push({ association: "Views" })
        }

        if (req.query.study_areas) {
            include.push({ association: "StudyAreas" })
        }

        const model = await Model.findByPk(req.params.id, { include, user: req.user })
        assert(model, NotFound)

        const json: any = model!.toJSON()

        if (json.metadata?.cols?.length) {
            json.metadata.cols = json.metadata.cols.map((col: any) => {

                if (col.name === "cnt") {
                    col.meta = {
                        datatype: "Number",
                        display: "Aggregate count"
                    }
                }

                else {
                    // const meta = ColumnsMetadata.find(item => item.hasOwnProperty(col.name));
                    const meta = ColumnsMetadata[col.name as keyof typeof ColumnsMetadata];
                    if (meta) {
                        col.meta = meta//[col.name];
                    }
                }

                return col
            })
        }

        res.json(json)
    }
})

// update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    request: {
        schema: {
            id: {
                in: ['params'],
                errorMessage: 'ID is wrong',
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id, {
            include: {
                association: "Tags",
                attributes: ["id", "name", "description"]
            },
            user: req.user
        });
        assert(model, NotFound);
        const transaction = await model.sequelize.transaction()
        try {
            await model.update(req.body, { user: req.user, transaction })
            if (Array.isArray(req.body.Tags)) {
                await model.setTags(req.body.Tags.map((t: any) => t.id))
            }
            await transaction.commit()
            res.json(model)
        } catch (ex) {
            await transaction.rollback()
            if (ex instanceof HttpError) {
                ex.data = { tags: ["DATA"] }
                ex.cause = ex.stack
                throw ex
            }
            const error = new InternalServerError("Updating subscription failed", { tags: ["DATA"] })
            error.cause = (ex as Error).stack
            throw error
        }
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    request: {
        schema: {
            name: {
                in: ['body'],
                exists: true,
                notEmpty: true,
                isLength: {
                    options: {
                        max: 100
                    }
                },
                custom: {
                    options: x => x.length <= 100,
                    errorMessage: "The name cannot be longer than 100 characters"
                }
            },
            description: {
                in: ['body']
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.create(req.body, { user: req.user })
        if (Array.isArray(req.body.Tags)) {
            await model.setTags(req.body.Tags.map((t: any) => t.id))
        }
        res.json(model)
    }
});
