import { Transform } from"stream"
import { DATA_TYPES, evaluate } from "./dataTypes"
import { logger } from "../logger"
import { PoolClient } from "pg";


// TODO: org_id column special?

/**
 * Convert stream of CSV lines (including a header in the first line)
 * to stream of SQL queries. The header line is used to build a
 * "create table" statement and the rest is converted to insert
 * statements.
 */
export default class CSV2DB extends Transform
{
    private client: PoolClient;

    private subscriptionID: number;

    private tableName: string;

    private dataTypes: (keyof typeof DATA_TYPES)[];

    private labels: string[];

    private descriptions: string[];

    public columnNames: string[];

    private insertRowsBuffer: string[];

    private insertRowsBufferMaxLength = 1000;

    constructor(
        client: PoolClient,
        subscriptionID: number,
        dataTypes: (keyof typeof DATA_TYPES)[],
        labels: string[] = [],
        descriptions: string[] = [],
        columnNames: string[] = []
    )
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

        this.subscriptionID   = subscriptionID
        this.dataTypes        = dataTypes
        this.labels           = labels
        this.descriptions     = descriptions
        this.client           = client;
        this.columnNames      = columnNames
        this.insertRowsBuffer = []

        this.tableName = "subscription_data_" + this.subscriptionID
    }

    async query(sql: string, params?: any)
    {
        try {
            return await this.client.query(sql, params)
        } catch (e) {
            logger.info(sql, { params, tags: ["SQL", "DATA"] })
            throw e
        }
    }

    _transform(line: string[], _encoding: any, next: (err?: Error | null) => void)
    {
        if (!this.columnNames.length) {
            this.columnNames = line
            this.writeMetaData()
            .then(() => this.createDataTable(this.columnNames))
            .then(() => next(), next);
        } else {
            const len = this.insertRowsBuffer.push(this.valueList(line));
            if (len >= this.insertRowsBufferMaxLength) {
                this.insertData(next);
            } else {
                next()
            }
        }
    }

    _flush(next: (err?: Error | null) => void) {
        if (this.insertRowsBuffer.length > 0) {
            this.insertData(next);
        } else {
            next()
        }
    }

    /**
     * Prepare a metadata object and write it to the corresponding data
     * subscription table
     */
    private async writeMetaData()
    {
        if (this.dataTypes.length !== this.columnNames.length) {
            throw new Error("The number of data types does not match the number of columns")
        }

        const metadata = {
            cols: this.columnNames.map((name, i) => ({
                name,
                dataType   : this.dataTypes[i],
                label      : this.labels[i] ?? name,
                description: this.descriptions[i] || ""
            }))
        };

        await this.query(
            `UPDATE "DataRequests" SET "metadata" = $1 WHERE id = $2`,
            [ JSON.stringify(metadata), this.subscriptionID ]
        );
    }

    private async createDataTable(columnNames: string[]) {
        let sql = `CREATE TABLE "${this.tableName}" `;

        sql += "(\n" + columnNames.map((name, i) => {
            switch (this.dataTypes[i]) {
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
                    throw new Error(`Invalid data type "${this.dataTypes[i]}"`)
            }
        }).join(",\n") + ");"

        // Drop the table if exists
        await this.query(`DROP TABLE IF EXISTS "${this.tableName}"`);
        
        // Drop the index if exists
        await this.query(`DROP INDEX IF EXISTS "${this.tableName}_unique"`);

        // Create the table
        await this.query(sql);

        // Create unique index to reject invalid powersets
        await this.query(`CREATE UNIQUE INDEX "${this.tableName}_unique" ON "${this.tableName
            }" USING btree(${columnNames.filter(c => c !== "cnt").map(c => `"${c}" Asc NULLS Last`).join(", ")})`);
    }

    private async insertData(next: (err?: Error | null) => void) {
        try {
            await this.query(`INSERT INTO "${this.tableName}" (${
                this.columnNames.map(x => `"${x}"`).join(",")
            }) VALUES ${ this.insertRowsBuffer.join(",\n") }`);
            this.insertRowsBuffer = [];
            next()
        } catch (ex) {
            next(ex)
        }
    }

    private valueList(values: any[]) {
        for (let i = values.length; i < this.columnNames.length; i++) {
            values.push(null)
        }

        return `(${values.map((v, i) => {
                let value = evaluate(v, this.dataTypes[i])
                if (value === null || v === null || value === "" || v === "") {
                    value = "NULL"
                }
                else if (typeof value === "string") {
                    value = this.client.escapeLiteral(value)
                }
                return value
            }).join(", ")
        })`;
    }
}
