import { QueryTypes }              from "sequelize"
import { pipeline }                from "stream/promises"
import { Response }                from "express"
import { randomUUID }              from "crypto"
import { Pool, PoolClient }        from "pg"
import * as HttpError              from "../errors"
import Text2Lines                  from "../DataManager/Text2Lines"
import Line2CSV                    from "../DataManager/Line2CSV"
import CSV2DB                      from "../DataManager/CSV2DB"
import { DATA_TYPES }              from "../DataManager/dataTypes"
import Subscription                from "../db/models/Subscription"
import { assert }                  from "../lib"
import { AppRequest, CurrentUser } from "../types"
import * as logger                 from "../services/logger"
import config                      from "../config"


const pool = new Pool({
    database: config.db.options.database,
    host    : config.db.options.host,
    password: config.db.options.password,
    user    : config.db.options.username,
    port    : config.db.options.port,

    // @ts-ignore
    ssl: config.db.options.dialectOptions!.ssl,
});


const JOBS: Record<string, ImportJob> = {};


export default class ImportJob
{
    id: string;

    client: PoolClient;

    timer?: NodeJS.Timeout;

    columnNames: string[];

    static find(id: string) {
        return JOBS[id];
    }

    static async create() {
        const client = await pool.connect();
        client.setMaxListeners(20)
        client.on('error'       , err => logger.error('ImportJob error: %s', err.stack));
        client.on('end'         , ()  => logger.log("ImportJob: database connection closed"));
        client.on('notification', msg => logger.log("ImportJob notification: %s", msg));

        try {
            // await client.query(`ALTER SYSTEM SET min_wal_size = '1GB'`)
            // await client.query(`ALTER SYSTEM SET max_wal_size = '2GB'`)
            await client.query('BEGIN');
            const id  = randomUUID();
            const job = JOBS[id] = new ImportJob(id, client);
            return job;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e
        }
    }

    constructor(id: string, client: PoolClient) {
        this.id = id
        this.client = client
        this.columnNames = []
    }

    async handleError(error: any, res: Response) {
        await this.rollback();
        this.client.release();
        delete JOBS[this.id];

        let message = error.message
        if (error.detail) message += ` -> ${error.detail}`
        if (error.line  ) message += ` (line: ${error.line})`
        res.status(500).end(message)
    }

    async rollback() {
        try {
            await this.client.query('ROLLBACK');
        } catch (e) {
            console.error(e);
        }
    }

    async handle(req: AppRequest, res: Response) {
        res.setTimeout(0);
        req.setTimeout(0);

        if (this.timer) clearTimeout(this.timer);

        /** @ts-ignore */
        let dataTypes: (keyof typeof DATA_TYPES)[] = String(
            req.query.types || req.headers["x-data-types"] || ""
        ).trim().split(/\s*,\s*/).map(decodeURIComponent);

        const labels: string[] = String(
            req.query.labels || ""
        ).split(/\s*,\s*/).filter(Boolean).map(decodeURIComponent);

        const descriptions: string[] = String(
            req.query.descriptions || ""
        ).split(/\s*,\s*/).filter(Boolean).map(decodeURIComponent);

        const type = String(req.query.data_type || "cube") as "cube" | "flat"

        const csv2db = new CSV2DB(
            this.client,
            +req.params.id,
            dataTypes,
            labels,
            descriptions,
            this.columnNames
        );

        const shouldContinue = req.headers["x-continue"] === "true";

        const txtStream = new Text2Lines();

        try {
        

            await pipeline(req, txtStream, new Line2CSV(), csv2db)
            
            this.columnNames = csv2db.columnNames

            if (shouldContinue) {
                this.timer = setTimeout(async () => {
                    await this.rollback();
                    delete JOBS[this.id];
                }, 2000);
                res.status(202).end(this.id)
            } else {
                await this.client.query('COMMIT');
                await this.finalize(+req.params.id, type, req.user)
                this.client.release()
                delete JOBS[this.id];
                res.status(200).end("Data imported successfully")
            }
        } catch (e) {
            // @ts-ignore
            e.line = txtStream!.currentLine
            await this.handleError(e, res)
        }
    }

    async finalize(subscriptionID: number, type: "cube" | "flat" = "cube",  user?: CurrentUser) {

        const subscription = await Subscription.findByPk(subscriptionID, { user });
        
        assert(subscription, "Subscription not found", HttpError.NotFound)

        const patch = {
            metadata: { ...subscription.metadata, type },
            completed: new Date()
        }

        if (type === "cube") {

            const countRow = await subscription.sequelize.query<any>(
                `SELECT "cnt" FROM "subscription_data_${subscriptionID}" WHERE ${
                    this.columnNames.map(c => c === "cnt" ? "" : `"${c}" IS NULL`)
                    .filter(Boolean)
                    .join(" AND ")
                } LIMIT 1`, {
                    type: QueryTypes.SELECT
                }
            );

            if (countRow.length === 0) {
                throw new Error("Unable to find a total row where any column other than 'cnt' is NULL")
            }

            patch.metadata.total = countRow[0].cnt
        }
        
        // @ts-ignore
        await subscription.update(patch, { user });
    }
}
