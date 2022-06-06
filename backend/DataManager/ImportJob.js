const { QueryTypes }       = require("sequelize");
const { pipeline }         = require('stream/promises');
const { randomUUID }       = require("crypto");
const { HttpError }        = require("httperrors");
const Text2Lines           = require("../DataManager/Text2Lines");
const Line2CSV             = require("../DataManager/Line2CSV");
const CSV2DB               = require("../DataManager/CSV2DB");
const { DATA_TYPES }       = require("../DataManager/dataTypes");
const Subscription         = require("../db/models/DataRequest");
const { assert }           = require("../lib");
const { Pool, PoolClient } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

const JOBS = {};


class ImportJob
{
    /**
     * @type {string}
     */
    id;

    /**
     * @type {PoolClient}
     */
    client;

    /**
     * @type {NodeJS.Timeout}
     */
    timer;

    /**
     * @type {string[]}
     */
    columnNames;

    /**
     * @param {string} id 
     */
    static find(id) {
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

    /**
     * @param {string} id 
     * @param {PoolClient} client 
     */
    constructor(id, client) {
        this.id = id
        this.client = client
        this.columnNames = []
    }

    /**
     * @param {Error} error 
     */
    async handleError(error) {
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

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    async handle(req, res) {
        res.setTimeout(0);
        req.setTimeout(0);

        if (this.timer) clearTimeout(this.timer);

        /** @ts-ignore @type {(keyof typeof DATA_TYPES)[]} */
        let dataTypes = String(req.query.types || req.headers["x-data-types"] || "").trim().split(/\s*,\s*/);

        /** @type { string[] } */
        const labels = String(req.query.labels || "").split(/\s*,\s*/).filter(Boolean);

        /** @type { string[] } */
        const descriptions = String(req.query.descriptions || "").split(/\s*,\s*/).filter(Boolean);

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
        
            await pipeline(req, new Text2Lines(), new Line2CSV(), csv2db).catch(err => {
                // @ts-ignore
                throw new Error(err.original ? err.original.detail || err.message : err.message)
            });

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

    async writeCounts(subscriptionID) {
        const subscription = await Subscription.findByPk(subscriptionID);
        
        assert(subscription, HttpError.NotFound("Subscription not found"))

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

module.exports = ImportJob;
