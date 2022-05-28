const { Transform }  = require("stream");
const { QueryTypes, Sequelize, Transaction } = require("sequelize");
const { DATA_TYPES, evaluate } = require("./dataTypes");
const { debuglog } = require("util")

const debug = debuglog("app:sql:import")

function logger(sql) {
    debug(sql)
}

// TODO: org_id column special?

/**
 * Convert stream of CSV lines (including a header in the first line)
 * to stream of SQL queries. The header line is used to build a
 * "create table" statement and the rest is converted to insert
 * statements.
 */
class CSV2DB extends Transform
{
    /**
     * @type {Sequelize}
     */
    #connection;

    /**
     * @type {Transaction}
     */
    #transaction;

    /**
     * @type {string}
     */
    #tableName;

    /**
     * @type {(keyof typeof DATA_TYPES)[]}
     */
    #dataTypes;

    /**
     * @type {string[]}
     */
    #labels;

    /**
     * @type {string[]}
     */
    #descriptions;

    /**
     * @type {string[]}
     */
    columnNames;

    #insertRowsBuffer;

    #insertRowsBufferMaxLength = 1000;

    /**
     * @param {Sequelize} db
     * @param {Transaction} trx
     * @param {string} tableName
     * @param {(keyof typeof DATA_TYPES)[]} dataTypes
     * @param {string[]} [labels = []]
     * @param {string[]} [descriptions = []]
     * @param {string[]} [columnNames = []]
     */
    constructor(db, trx, tableName, dataTypes, labels = [], descriptions = [], columnNames = [])
    {
        if (!tableName) {
            throw new Error("No table name provided")
        }

        if (!dataTypes || !dataTypes.length) {
            throw new Error("No data types provided")
        }
        
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });

        this.#tableName    = tableName
        this.#dataTypes    = dataTypes
        this.#labels       = labels
        this.#descriptions = descriptions
        this.#connection   = db;
        this.#transaction  = trx;
        this.columnNames   = columnNames

        this.#insertRowsBuffer = []
    }

    _transform(line, _encoding, next)
    {
        if (!this.columnNames.length) {
            this.columnNames = line
            this.#writeMetaData(this.columnNames)
            .then(() => this.#createDataTable(this.columnNames))
            .then(() => next(), next);
        } else {
            const len = this.#insertRowsBuffer.push(this.#valueList(line));
            if (len >= this.#insertRowsBufferMaxLength) {
                this.#insertData(next);
            } else {
                next()
            }
        }
    }

    _flush(next) {
        if (this.#insertRowsBuffer.length > 0) {
            this.#insertData(next);
        } else {
            next()
        }
    }

    /**
     * @param {string[]} columnNames 
     */
    async #writeMetaData(columnNames)
    {
        if (!columnNames || !columnNames.length) {
            throw new Error("No column names provided")
        }

        // Create the meta table if not exists
        await this.#connection.query(`CREATE TABLE IF NOT EXISTS "meta" (
            "table" Character Varying(100),
            "name"  Character Varying(100),
            "type"  Character Varying(100),
            "label" Character Varying(100),
            "description" Character Varying(255),
            "createdAt" Timestamp With Time Zone,
            "updatedAt" Timestamp With Time Zone
        )`, {
            transaction: this.#transaction,
            type: QueryTypes.RAW,
            logging: logger
        });

        // Delete previous entries
        await this.#connection.query(`DELETE FROM "meta" WHERE "table" = ?`, {
            transaction: this.#transaction,
            type: QueryTypes.DELETE,
            logging: logger,
            replacements: [ this.#tableName ]
        });
        
        let i = 0;
        for (let col of columnNames) {
            const now = new Date()
            await this.#connection.query(
                `INSERT INTO "meta" ("table", "name", "type", "label", "description", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
                {
                    transaction: this.#transaction,
                    type: QueryTypes.INSERT,
                    logging: logger,
                    replacements: [
                        this.#tableName,
                        col,
                        this.#dataTypes[i],
                        this.#labels[i] || null,
                        this.#descriptions[i] || null,
                        now,
                        now
                    ]
                }
            );
            i++;
        }
    }

    /**
     * @param {string[]} columnNames 
     */
    async #createDataTable(columnNames) {
        let sql = `CREATE TABLE "${this.#tableName}" `;

        sql += "(\n" + columnNames.map((name, i) => {
            switch (this.#dataTypes[i]) {
                case "boolean":
                    return JSON.stringify(name) + " BOOLEAN";
                case "integer":
                    return JSON.stringify(name) + " INTEGER";
                case "float":
                    return JSON.stringify(name) + " REAL";
                case "string":
                    return JSON.stringify(name) + " TEXT";
                case "day":
                case "week":
                case "month":
                case "year":
                    return JSON.stringify(name) + " DATE";
                default:
                    throw new Error(`Invalid data type "${this.#dataTypes[i]}"`)
            }
        }).join(",\n") + ");"

        // Drop the table if exists
        await this.#connection.query(`DROP TABLE IF EXISTS "${this.#tableName}"`, {
            transaction: this.#transaction,
            type: QueryTypes.RAW,
            logging: logger
        });
        
        // Drop the index if exists
        await this.#connection.query(`DROP INDEX IF EXISTS "${this.#tableName}_unique"`, {
            transaction: this.#transaction,
            type: QueryTypes.RAW,
            logging: logger
        });

        // Create the table
        await this.#connection.query(sql, {
            transaction: this.#transaction,
            type: QueryTypes.RAW,
            logging: logger
        });

        // Create unique index to reject invalid powersets
        let index = `CREATE UNIQUE INDEX "${this.#tableName}_unique" ON "${this.#tableName}" USING btree(${
            columnNames.filter(c => c !== "cnt").map(c => `"${c}" Asc NULLS Last`).join(", ")
        })`;
        await this.#connection.query(index, {
            transaction: this.#transaction,
            type: QueryTypes.RAW,
            logging: logger
        });
    }

    async #insertData(next) {
        try {
            let sql = `INSERT INTO "${this.#tableName}" (${
                this.columnNames.map(x => `"${x}"`).join(",")
            }) VALUES ${ this.#insertRowsBuffer.join(",\n") }`;

            await this.#connection.query(sql, {
                transaction: this.#transaction,
                type: QueryTypes.INSERT,
                logging: logger
            })

            this.#insertRowsBuffer = [];
            next()
        } catch (ex) {
            next(ex)
        }
    }

    /**
     * @param {any[]} values
     */
    #valueList(values) {
        for (let i = values.length; i < this.columnNames.length; i++) {
            values.push(null)
        }

        return `(${values.map((v, i) => {
                let value = evaluate(v, this.#dataTypes[i])
                if (value === null || v === null || value === "" || v === "") {
                    value = "NULL"
                }
                else if (typeof value === "string") {
                    value = "'" + value + "'"
                }
                return value
            }).join(", ")
        })`;
    }
}

module.exports = CSV2DB;
