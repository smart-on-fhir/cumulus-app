

/**
 * The row objects that can be handled by this class
 */
interface Row extends Record<string, any> {

    /**
     * Rows must have a "cnt" property representing the aggregate count
     */
    cnt: number
    
    /**
     * Rows may have a "queryid" which can be used to request back the
     * line-level data
     */
    // queryid: string | undefined

    /**
     * Anything else is the actual data values
     */
    [key: string]: string | boolean | number | null
}

export default class PowerSet
{
    public readonly cols: app.DataRequestDataColumn[] = [];

    public readonly rows: Row[] = [];

    protected constructor(cols: app.DataRequestDataColumn[], rows: Row[])
    {
        this.cols = cols;
        this.rows = rows;
    }

    static from<RowType extends Row>(data: { cols: app.DataRequestDataColumn[], rows: RowType[][] })
    {
        const cols = data.cols;
        const rows: RowType[] = [];
        
        data.rows.forEach((row, i) => {
            const rowObject: any = {}
            
            Object.defineProperty(rowObject, "__row_id__", {
                configurable: false,
                enumerable  : false,
                writable    : false,
                value       : i
            })

            data.cols.forEach((col, colIndex) => {
                // rowObject[col.name] = row[colIndex]
                // @ts-ignore
                rowObject[col.name] = col.dataType === "string" && row[colIndex] === "" ? null : row[colIndex]
            })
            rows.push(rowObject)
        })

        return new PowerSet(cols, rows)
    }

    // Static Utils
    // ------------------------------------------------------------------------
    public static isEmpty(value: any): boolean {
        return (value === null || value === undefined || value === "")
    }

    public static groupRows(rows: Row[], by: keyof Row, normalize = false) {
        const groups: Record<string, Row[]> = {}

        if (normalize) {

        }

        rows.forEach(row => {
            const group = row[by] + ""
            if (!groups.hasOwnProperty(group)) {
                groups[group] = []
            }
            groups[group].push(row)
        })

        return groups
    }

    public static getUniqueValuesFromColumn(rows: Row[], colName: keyof Row, includeEmpty = false) {
        const set = new Set()
        rows.forEach(row => {
            const value = row[colName]
            if (!PowerSet.isEmpty(value) || includeEmpty) {
                if (!set.has(value)) {
                    set.add(value)
                }
            }
        })
        return set
    }

    // Getters
    // ------------------------------------------------------------------------

    public getColumnByName(name: string) {
        return this.cols.find(c => c.name === name);
    }

    public getColumnAt(index: number) {
        return this.cols[index];
    }

    public getLabelForColumnName(name: string) {
        const col = this.getColumnByName(name)
        return col ? col.label || col.name : name
    }

    public getUniqueValuesFromColumn(colName: keyof Row, includeEmpty = false) {
        const set = new Set()
        // const colIndex = this.cols.findIndex(c => c.name === colName)
        this.forEachRow(row => {
            const value = row[colName]
            if (!PowerSet.isEmpty(value) || includeEmpty) {
                if (!set.has(value)) {
                    set.add(value)
                }
            }
        })

        return set
    }

    // Iterators
    // ------------------------------------------------------------------------

    public forEachColumn(callback: (column: app.DataRequestDataColumn, index: number) => any): PowerSet {
        this.cols.forEach((col, index) => callback(col, index))
        return this
    }

    public forEachRow(callback: (row: Row, index: number) => any): PowerSet {
        this.rows.forEach((row, index) => callback(row, index))
        return this
    }

    public forEachRowCell(row: Row, callback: (value: any, col: app.DataRequestDataColumn, index: number) => any): PowerSet {
        this.forEachColumn((col, index) => callback(row[col.name], col, index))
        return this
    }

    // Query methods
    // ------------------------------------------------------------------------

    /**
     * We have to consider two use cases:
     * 1. No filters are applied - in this case the counts are already in the
     *    power set rows. We just have to filter the rows that have non-null
     *    value for every listed column.
     * 2. If any filters have been applied, the counts are not to be trusted!
     *    In this case we need to manually group by every listed column and
     *    compute the totals for each combination.
     * `
     * Consider the following super set:
     * 
     * |  A  |  B  |  C  | cnt |
     * |:---:|:---:|:---:|:---:|
     * |  2  |  F  |  2  |  N  |
     * |  2  |  F  |  3  |  N  |
     * |  2  |  F  |  -  | 113 |
     * |  2  |  M  |  4  |  5  |
     * |  2  |  M  |  4  |  6  |
     * |  2  |  M  |  -  | 100 |
     * |  2  |  -  |  6  |  N  |
     * |  2  |  -  |  7  |  N  |
     * |  2  |  -  |     | 213 |
     * |  -  |  F  |  8  |  N  |
     * |  -  |  F  |  4  |  N  |
     * |  -  |  F  |  -  |  N  |
     * |  -  |  M  |  5  |  N  |
     * |  -  |  M  |  2  |  N  |
     * |  -  |  M  |  -  |  N  |
     * |  -  |     |  7  |  N  |
     * |  -  |     |  7  |  N  |
     * |  -  |     |  -  | 432 |
     * 
     * **1 dimension:**
     *   
     *     col=A -> (A !== null && rest === null)
     * 
     * |  A  | cnt |
     * |:---:|:---:|
     * |  2  | 213 |
     * 
     * **2 dimensions:**
     * 
     *     col=A, group=B -> (A !== null && B !== null && rest === null)
     * 
     * |  A  |  B  | cnt |
     * |:---:|:---:|:---:|
     * |  2  |  F  | 113 |
     * |  2  |  M  | 100 |
     * 
     * After filter(C > 5) some rows are removed, thus even though the total rows remain,
     * their "cnt" values no longer represent the correct total.
     * 
     * |  A  |  B  |  C  | cnt |   
     * |:---:|:---:|:---:|:---:| 
     * |  2  |  F  |  -  | 113 |
     * |  2  |  M  |  -  | 100 |
     * |  2  |  -  |  6  |  N  |
     * |  2  |  -  |  7  |  N  |   
     * |  2  |  -  |     | 213 |   
     * |  -  |  F  |  8  |  N  |   
     * |  -  |  F  |  -  |  N  |
     * |  -  |  M  |  -  |  N  | 
     * |  -  |     |  7  |  N  | 
     * |  -  |     |  7  |  N  | 
     * |  -  |     |  -  | 432 | 
     * 
     * **1 dimension:**
     *   
     *     col=A -> (A !== null && rest === null)
     * 
     * |  A  | cnt |                   |
     * |:---:|:---:|-------------------|
     * |  2  | 213 | -> **INCORRECT!** |
     * 
     * **2 dimensions:**
     * 
     *     col=A, group=B -> (A !== null && B !== null && rest === null)
     * 
     * |  A  |  B  | cnt |                   |
     * |:---:|:---:|:---:|-------------------|
     * |  2  |  F  | 113 | -> **INCORRECT!** |
     * |  2  |  M  | 100 | -> **INCORRECT!** |
     * 
     * `
     */
    public getChartData({ column, groupBy = "", filters = [] }: { column: string, groupBy?: string, filters?: app.Filter[] }) {

        const groups: Record<string, Row> = {};

        
        // const col1 = this.getColumnByName(column);
        // const col2 = this.getColumnByName(groupBy);
        // const col3 = this.getColumnByName("cnt");
        
        // if (!col1) {
        //     throw new Error(`No such column "${column}"`);
        // }
        
        // cols.push(col1)
        
        // if (col2) {
        //     cols.push(col2);
        // }
        
        // if (col3) {
        //     cols.push(col3);
        // }
        
        let preservedColumns = ["cnt", "queryid", column];
        
        if (groupBy) {
            preservedColumns.push(groupBy)
        }
        
        const cols = preservedColumns.map(name => this.getColumnByName(name)).filter(Boolean) as app.DataRequestDataColumn[];
        const col1 = cols.find(c => c.name === column);

        if (!col1) {
            throw new Error(`No such column "${column}"`);
        }
        
        preservedColumns = filters.reduce((prev, cur) => {
            if (!prev.includes(cur.left)) {
                prev.push(cur.left)
            }
            return prev
        }, preservedColumns);
        
        this.rows.filter(row => {
            for (let key in row) {
                const value = row[key];

                // The primary visualized column CANNOT BE NULL
                if (key === column) {
                    if (value === null) {
                        return false
                    }
                    continue
                }

                // If group-by column is used it CANNOT BE NULL
                if (groupBy && key === groupBy) {
                    if (value === null) {
                        return false
                    }
                    continue
                }

                // The "cnt" column is ALWAYS included
                if (key === "cnt") {
                    continue
                }

                // The "queryid" column is ALWAYS included
                if (key === "queryid") {
                    continue
                }

                // Any column that is used in filter conditions MUST be included
                const isInFilters = filters.some(f => f.operator && key === f.left); 
                if (isInFilters) {
                    continue
                }
                
                // Anything else should be an "additional data" column. These columns
                // are included but their "cnt" must be reset to zero so that they
                // don't influence the total count calculations.
                if (!isInFilters) {
                    // if (value === null) {
                    //     console.log(key, JSON.stringify(value))
                    // }
                    // if (value === undefined) {
                    //     console.log(key, JSON.stringify(value))
                    // }
                    if (value !== null) {
                        row.cnt = 0
                    }
                }
            }
            return true;
        }).forEach(row => {

            let groupKey = row[column] + "";
            if (groupBy) {
                groupKey += "|" + row[groupBy];
            }

            let group: Row = groups[groupKey];

            // Create the group on the first occurrence
            if (!group) {
                group = groups[groupKey] = { cnt: 0 };
            }

            // Merge new values into the existing group row
            for (let key in row) {
                if (key === "cnt") {
                    group.cnt += row.cnt
                }
                else {
                    let groupedValue = group[key];
                    let rowValue     = row[key];

                    
                    if (Array.isArray(groupedValue)) {
                        if (rowValue !== null) {
                            if (!groupedValue.includes(rowValue)) {
                                groupedValue.push(rowValue)
                            }
                        }
                    } else {
                        if (key in group) {
                            if (groupedValue !== rowValue) {
                                // @ts-ignore
                                group[key] = [groupedValue, rowValue]
                            }
                        } else {
                            group[key] = rowValue
                        }
                    }
                }
            }
        });

        // console.log(groups)

        const rows = Object.values(groups).sort((a, b) => {
            if (col1.dataType === "integer" || col1.dataType === "float") {
                return (a[column] as number) - (b[column] as number)
            }
            return String(a[column] + "").localeCompare(b[column] + "")
        }).map((row, i) => {
            Object.defineProperty(row, "__row_id__", {
                configurable: false,
                enumerable  : false,
                writable    : false,
                value       : i
            })
            return row
        });

        return new PowerSet(this.cols, rows)
    }



    /** 
     * Returns new PowerSet with all the rows having not-listed and not empty
     * columns removed.
     * @example
     * `
     * pick(["gender"]) -> {
     *   cols: [
     *      { name: "gender", ... },
     *      { name: "cnt", ... }
     *   ],
     *   rows: [
     *      { gender: F, cnt: 10 },
     *      { gender: M, cnt: 12 }
     *   ]
     * };
     * 
     * pick(["gender", "race"]) -> {
     *   cols: [
     *      { name: "gender", ... },
     *      { name: "race", ... },
     *      { name: "cnt", ... }
     *   ],
     *   rows: [
     *      { gender: F, race: "WHITE", cnt: 5 },
     *      { gender: F, race: "BLACK", cnt: 6 },
     *      { gender: M, race: "WHITE", cnt: 7 },
     *      { gender: F, race: "BLACK", cnt: 3 }
     *   ]
     * };
     * `
     */
    public pick(columns: string[]) {

        // First make sure these columns exist
        const cols = columns.map(name => this.getColumnByName(name)).filter(Boolean) as app.DataRequestDataColumn[];

        // Add the "cnt" column if not explicitly  requested
        if (!cols.find(c => c.name === "cnt")) {
            cols.push({
                name: "cnt",
                label: "Count",
                description: "Count",
                dataType: "integer"
            })
        }

        // Need to verify that ONLY the columns listed in conditions have some
        // value. Everything else in the row must be empty
        const rows = this.rows.filter(row => {
            // const nulls = this.getNullColumnNames(row)
            // return columns.every(col => !nulls.includes(col))
            for (let key in row) {
                
                // Ignore private key "queryid"
                if (key === "queryid") {
                    continue;
                }

                // if (columns.some(name => (
                //     name !== "cnt" &&
                //     name !== "queryid" &&
                //     PowerSet.isEmpty(row[name])
                // ))) {
                //     return false;
                // }

                const isEmpty = PowerSet.isEmpty(row[key])
                const isRequested = key === "cnt" || columns.includes(key)

                // Exclude row if one of the listed columns is empty
                if (isRequested && isEmpty) {
                    return false;
                }

                // Exclude row if one of the non-listed columns is not empty
                if (!isRequested && !isEmpty) {
                    return false;
                }
            }
            return true;
        })

        return new PowerSet(cols, rows);
    }

    public getNullColumnNames(row: Row, except?: string[]): string[] {
        return Object.keys(row).reduce((prev, cur, index) => {
            if (row[cur] === null) {
                const name = this.cols[index].name
                if (!except || !except.includes(name)) {
                    prev.push(this.cols[index].name)
                }
            }
            return prev
        }, [] as string[]);
    }

    public filter(filter: (row: Row, rowIndex: number) => boolean, thisArg?: any): PowerSet {
        const rows: Row[] = this.rows.filter((row, index) => filter(row, index), thisArg)
        return new PowerSet(this.cols, rows)
    }

    public where(map: Record<keyof Row, any>) {
        return this.filter(row => {
            for (let key in map) {
                if (row[key] !== map[key]) {
                    return false
                }
            }
            return true
        })
    }

    // ------------------------------------------------------------------------

    removeTotal()
    {
        const filter = (row: Row) => {
            if (!row.cnt) {
                throw new Error(`No "cnt" found in row ${JSON.stringify(row)}`)
            }
            const nulls = Object.values(row).filter(x => x === null).length
            if (nulls === this.cols.length - 2) { // queryid & cnt
                // console.log("Filtered out the row: ", row)
                return false
            }
            return true
        }
        const rows: Row[] = this.rows.filter(filter)
        return new PowerSet(this.cols, rows)
    }

    sort(by: keyof Row, dir: "asc"|"desc" = "asc")
    {
        const index = this.cols.findIndex(col => col.name === by)
        const type  = this.cols.find(col => col.name === by)?.dataType

        const rows = this.rows.sort((a, b) => {
            let _a = a[index]
            let _b = b[index]
            if (type === "integer" || type === "float") {
                return (
                    _b === null ? -1 : _a === null ? 1 :
                    (+_b) - (+_a)
                ) * (dir === "asc" ? 1 : -1)
            }
            return String(_b || "").localeCompare(String(_a || "")) * (dir === "asc" ? 1 : -1)
        })

        return new PowerSet(this.cols, rows)
        // return this;//new PowerSet(this.cols, rows, this.countColumn)
    }

    count(filter: (row: Row, rowIndex: number) => boolean = () => true)
    {
        let rows = this.filter(filter).rows

        if (!rows.length) {
            return -1;
        }

        return rows.reduce((prev, curr) => prev + curr.cnt, 0)
    }

    group(by: keyof Row, postProcess?: (groups: Record<string, number>) => Record<string, number>)
    {
        const groups: Record<string, number> = {}
        
        this.rows.forEach(row => {
            const value = row[by]
            const count = row.cnt

            if (!groups.hasOwnProperty(String(value))) {
                groups[value + ""] = 0
            }

            groups[value + ""] += +count
        })

        if (postProcess) {
            return postProcess(groups)
        }

        return groups
    }

}

