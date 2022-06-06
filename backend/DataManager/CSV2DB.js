const { Transform }  = require("stream");
const { DATA_TYPES, evaluate } = require("./dataTypes");
const { PoolClient } = require("pg")


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
     * @type {PoolClient}
     */
    #client;

    /**
     * @type {number}
     */
    #subscriptionID;

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
     * @param {PoolClient} client
     * @param {number} subscriptionID
     * @param {(keyof typeof DATA_TYPES)[]} dataTypes
     * @param {string[]} [labels = []]
     * @param {string[]} [descriptions = []]
     * @param {string[]} [columnNames = []]
     */
    constructor(client, subscriptionID, dataTypes, labels = [], descriptions = [], columnNames = [])
    {
        if (!subscriptionID) {
            throw new Error("No subscription ID provided")
        }

        if (!dataTypes || !dataTypes.length) {
            throw new Error("No data types provided")
        }
        
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });

        this.#subscriptionID   = subscriptionID
        this.#dataTypes        = dataTypes
        this.#labels           = labels
        this.#descriptions     = descriptions
        this.#client           = client;
        this.columnNames       = columnNames
        this.#insertRowsBuffer = []

        this.#tableName = "subscription_data_" + this.#subscriptionID
    }

    async query(sql, params)
    {
        try {
            return await this.#client.query(sql, params)
        } catch (e) {
            console.log(sql, params)
            throw e
        }
    }

    _transform(line, _encoding, next)
    {
        if (!this.columnNames.length) {
            this.columnNames = line
            this.#writeMetaData()
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
     * Prepare a metadata object and write it to the corresponding data
     * subscription table
     */
    async #writeMetaData()
    {
        if (this.#dataTypes.length !== this.columnNames.length) {
            throw new Error("The number of data types does not match the number of columns")
        }

        const metadata = {
            cols: this.columnNames.map((name, i) => ({
                name,
                dataType   : this.#dataTypes[i],
                label      : this.#labels[i] ?? name,
                description: this.#descriptions[i] || ""
            }))
        };

        await this.query(
            `UPDATE "DataRequests" SET "metadata" = $1 WHERE id = $2`,
            [ JSON.stringify(metadata), this.#subscriptionID ]
        );
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

                case "date:YYYY-MM-DD":
                case "date:YYYY wk W":
                case "date:YYYY-MM":
                case "date:YYYY":
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
        await this.query(`DROP TABLE IF EXISTS "${this.#tableName}"`);
        
        // Drop the index if exists
        await this.query(`DROP INDEX IF EXISTS "${this.#tableName}_unique"`);

        // Create the table
        await this.query(sql);

        // Create unique index to reject invalid powersets
        await this.query(`CREATE UNIQUE INDEX "${this.#tableName}_unique" ON "${this.#tableName
            }" USING btree(${columnNames.filter(c => c !== "cnt").map(c => `"${c}" Asc NULLS Last`).join(", ")})`);
    }

    async #insertData(next) {
        try {
            await this.query(`INSERT INTO "${this.#tableName}" (${
                this.columnNames.map(x => `"${x}"`).join(",")
            }) VALUES ${ this.#insertRowsBuffer.join(",\n") }`);
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
