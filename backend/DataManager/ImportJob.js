const { Sequelize, Transaction } = require("sequelize");
const { pipeline }   = require('stream/promises');
const DB             = require("../db/index");
const Text2Lines     = require("../DataManager/Text2Lines");
const Line2CSV       = require("../DataManager/Line2CSV");
const CSV2DB         = require("../DataManager/CSV2DB");
const { DATA_TYPES } = require("../DataManager/dataTypes");
const { randomUUID } = require("crypto");


const JOBS = {};


class ImportJob
{
    /**
     * @type {string}
     */
    id;

    /**
     * @type {Sequelize}
     */
    db;

    /**
     * @type {Transaction}
     */
    tx;

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
        const id = randomUUID();
        const db = await DB();
        const tx = await db.transaction();
        const job = JOBS[id] = new ImportJob(id, db, tx);
        return job;
    }

    /**
     * @param {string} id 
     * @param {Sequelize} db 
     * @param {Transaction} tx 
     */
    constructor(id, db, tx) {
        this.id = id
        this.db = db
        this.tx = tx
        this.columnNames = []
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    async handle(req, res) {
        res.setTimeout(0);
        req.setTimeout(0);

        if (this.timer) clearTimeout(this.timer);

        const tableName = "data_" + req.params.table;

        /** @ts-ignore @type {(keyof typeof DATA_TYPES)[]} */
        let dataTypes = String(req.query.types || req.headers["x-data-types"] || "").trim().split(/\s*,\s*/);

        /** @type { string[] } */
        const labels = String(req.query.labels || "").split(/\s*,\s*/).filter(Boolean);

        /** @type { string[] } */
        const descriptions = String(req.query.descriptions || "").split(/\s*,\s*/).filter(Boolean);

        const csv2db = new CSV2DB(
            this.db,
            this.tx,
            tableName,
            dataTypes,
            labels,
            descriptions,
            this.columnNames
        );

        const shouldContinue = req.headers["x-continue"] === "true";
        
        await pipeline(req, new Text2Lines(), new Line2CSV(), csv2db).catch(err => {
            // @ts-ignore
            throw new Error(err.original ? err.original.detail || err.message : err.message)
        });

        this.columnNames = csv2db.columnNames

        if (shouldContinue) {
            this.timer = setTimeout(async () => {
                await this.tx.rollback().catch(e => console.error(e));
                delete JOBS[this.id];
            }, 2000);
            res.status(202).end(this.id)
        } else {
            await this.tx.commit().catch(e => console.error(e));
            delete JOBS[this.id];
            res.status(200).end("Data imported successfully")
        }
    }

    async destroy() {
        await this.tx.rollback();
        delete JOBS[this.id];
    }
}

module.exports = ImportJob;
