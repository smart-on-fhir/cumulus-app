import { Transform }               from "stream"
import { Transaction, QueryTypes } from "sequelize"
import { DATA_TYPES }              from "./dataTypes"
import CSVColumn                   from "./CSVColumn"
import { MultiColumnMetadata }     from "./lib"
import Subscription                from "../db/models/Subscription"
import SystemUser                  from "../SystemUser"
import { EmptyString }             from "../lib"
import { BadRequest }              from "../errors"


export default class RemoteCsvToDb extends Transform
{
    private insertRowsBuffer: string[]

    /**
     * How many rows to insert at once
     */
    private insertRowsBufferMaxLength = 1000

    private subscription: Subscription
    
    private tableName: string

    private transaction: Transaction

    private columns: CSVColumn[]

    private columnsMetadata: MultiColumnMetadata

    constructor(subscription: Subscription, transaction: Transaction, columnsMetadata: MultiColumnMetadata = {})
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });

        this.subscription     = subscription
        this.transaction      = transaction
        this.tableName        = `subscription_data_${subscription.id}`
        this.columns          = []
        this.insertRowsBuffer = []
        this.columnsMetadata   = columnsMetadata
    }

    _transform(line: string[], _encoding: any, next: (err?: Error | null) => void)
    {
        try {
            // This is the first line so it will be our header
            if (!this.columns.length) {
                this.ingestHeaderLine(line).then(() => this.createDataTable()).then(() => next(), next);
            } else {
                const list = this.valueList(line);
                const len = this.insertRowsBuffer.push(list);
                if (len >= this.insertRowsBufferMaxLength) {
                    this.insertData().then(() => next(), next);
                } else {
                    next()
                }
            }
        }
        catch(e) {
            next(e as Error)
        }
    }

    _flush(next: (err?: Error | null) => void) {
        if (this.insertRowsBuffer.length > 0) {
            this.insertData().then(() => this.finalize()).then(() => next(), next);
        } else {
            this.finalize().then(() => next(), next);
        }
    }

    private async insertData()
    {
        await this.subscription.sequelize.query(
            `INSERT INTO "${this.tableName}" (${
                this.columns.map(x => `"${x.name}"`).join(",")
            }) VALUES ${ this.insertRowsBuffer.join(",\n") }`,
            { transaction: this.transaction }
        );
        this.insertRowsBuffer = [];
    }

    private async ingestHeaderLine(line: string[])
    {
        const { names=[], dataTypes=[], descriptions=[] } = this.columnsMetadata

        if (names.length && names.length !== line.length) {
            throw new BadRequest(`The file contains ${line.length} columns but names for ${names.length} columns were provided`)
        }
        if (dataTypes.length && dataTypes.length !== line.length) {
            throw new BadRequest(`The file contains ${line.length} columns but data types for ${dataTypes.length} columns were provided`)
        }
        if (descriptions.length && descriptions.length !== line.length) {
            throw new BadRequest(`The file contains ${line.length} columns but descriptions for ${descriptions.length} columns were provided`)
        }

        this.columns = line.map((name, i) => new CSVColumn(name, {
            label      : names[i],
            dataType   : dataTypes[i] as keyof typeof DATA_TYPES,
            description: descriptions[i]
        }))
    }

    private async createDataTable()
    {
        // Drop the table if exists
        await this.subscription.sequelize.query(`DROP TABLE IF EXISTS "${this.tableName}"`, { transaction: this.transaction });
        
        // Drop the index if exists
        await this.subscription.sequelize.query(`DROP INDEX IF EXISTS "${this.tableName}_unique"`, { transaction: this.transaction });

        // Create the table
        await this.subscription.sequelize.query(`CREATE TABLE "${this.tableName}" (${
            this.columns.map(c => JSON.stringify(c.name) + (c.name.match(/^cnt_?/) ? " INTEGER" : " TEXT")).join(", ")
         })`, { transaction: this.transaction });

        // Create unique index to reject invalid powersets
        await this.subscription.sequelize.query(`CREATE UNIQUE INDEX "${this.tableName}_unique" ON "${
            this.tableName}" USING btree(${this.getDataColumns().map(
                c => `"${c.name}" Asc NULLS Last`).join(", ")})`,
            { transaction: this.transaction }
        );
    }

    private async finalize() {
        
        const countRow = await this.subscription.sequelize.query<{ cnt: number }>(
            `SELECT "cnt" FROM "subscription_data_${this.subscription.id}" WHERE ${
                this.getDataColumns().map(c => `"${c.name}" IS NULL`)
                .filter(Boolean)
                .join(" AND ")
            } LIMIT 1`, {
                type: QueryTypes.SELECT,
                transaction: this.transaction
            }
        );
    
        if (countRow.length === 0) {
            throw new BadRequest("Unable to find a total row where all data columns are NULL")
        }

        await this.subscription.update({
            metadata: { cols: this.columns.map(c => c.toJSON()), total: countRow[0].cnt },
            completed: new Date()
        }, { user: SystemUser, transaction: this.transaction });
    }

    private valueList(values: any[]): string {

        
        if (values.length > this.columns.length) {
            throw new BadRequest(`Number of cells exceeds the number of columns`)
        }

        // if values are less then columns - append nulls
        for (let i = values.length; i < this.columns.length; i++) {
            values.push(null)
        }

        return `(${values.map((v, i) => {
            if (v instanceof EmptyString) {
                return "''"
            }
            
            if (v === "") {
                return "NULL"
            }

            const typeName = this.columns[i].dataType

            const typeDef = DATA_TYPES[typeName]

            if (!typeDef) {
                throw new BadRequest(`Invalid data type "${typeName}" at column ${i + 1}`)
            }

            const value = typeDef.set(v)

            if (value === null || value === "") {
                return "NULL"
            }

            return this.subscription.sequelize.escape(value)
        }).join(", ")})`;
    }

    /**
     * Returns an array of column metadata objects for every data column,
     * meaning that count columns (cnt, xnt_min, cnt_max) are not included
     */
    private getDataColumns() {
        return this.columns.filter(c => !c.name.match(/^cnt_?/))
    }
}