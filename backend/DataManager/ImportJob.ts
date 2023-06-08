import { QueryTypes }        from "sequelize"
import { pipeline }          from "stream/promises"
import { randomUUID }        from "crypto"
import { Pool, PoolClient }  from "pg"
import * as HttpError        from "../errors"
import Text2Lines            from "../DataManager/Text2Lines"
import Line2CSV              from "../DataManager/Line2CSV"
import CSV2DB                from "../DataManager/CSV2DB"
import { DATA_TYPES }        from "../DataManager/dataTypes"
import Subscription          from "../db/models/DataRequest"
import { assert }            from "../lib"
import { Request, Response } from "express"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

const JOBS = {};


export default class ImportJob
{
    id: string;

    client: PoolClient;

    timer: NodeJS.Timeout;

    columnNames: string[];

    static find(id: string) {
        return JOBS[id];
    }

    static async create() {
        const client = await pool.connect();
        
        client.on('error', err => console.error('ImportJob error:', err.stack));
        client.on('end', () => console.log("ImportJob: database connection closed"));
        client.on('notification', msg => console.log("ImportJob notification:", msg));

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

    async handleError(error: Error) {
        await this.rollback();
        this.client.release();
        delete JOBS[this.id];
        throw error
    }

    async rollback() {
        try {
            await this.client.query('ROLLBACK');
        } catch (e) {
            console.error(e);
        }
    }

    async handle(req: Request, res: Response) {
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

        const csv2db = new CSV2DB(
            this.client,
            +req.params.id,
            dataTypes,
            labels,
            descriptions,
            this.columnNames
        );

        const shouldContinue = req.headers["x-continue"] === "true";

        try {
        
            await pipeline(req, new Text2Lines(), new Line2CSV(), csv2db)
            
            // .catch(err => {
            //     // @ts-ignore
            //     throw new Error(err.original ? err.original.detail || err.message : err.message)
            // });

            this.columnNames = csv2db.columnNames

            if (shouldContinue) {
                this.timer = setTimeout(async () => {
                    await this.rollback();
                    delete JOBS[this.id];
                }, 2000);
                res.status(202).end(this.id)
            } else {
                await this.client.query('COMMIT');
                await this.writeCounts(+req.params.id)
                this.client.release()
                delete JOBS[this.id];
                res.status(200).end("Data imported successfully")
            }
        } catch (e) {
            await this.handleError(e)
        }
    }

    async writeCounts(subscriptionID: number) {
        const subscription = await Subscription.findByPk(subscriptionID);
        
        assert(subscription, "Subscription not found", HttpError.NotFound)

        const countRow = await subscription.sequelize.query(
            `SELECT "cnt" FROM "subscription_data_${subscriptionID}" WHERE ${
                this.columnNames.map(c => c === "cnt" ? "" : `"${c}" IS NULL`)
                .filter(Boolean)
                .join(" AND ")
            } LIMIT 1`, {
                type: QueryTypes.SELECT
            }
        );

        await subscription.update({
            // @ts-ignore
            metadata: { ...subscription.metadata, total: countRow[0].cnt },
            completed: new Date()
        });
    }
}
