import { SupportedChartTypes } from "./components/Dashboard/config";

/**
 * The row objects that can be handled by this class
 */
interface Row {

    /**
     * Rows must have a "cnt" property representing the aggregate count
     */
    cnt: number
    
    /**
     * Rows may have a "queryid" which can be used to request back the
     * line-level data
     */
    queryid: string

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

    static from<RowType extends Row>(data: { cols: app.DataRequestDataColumn[], rows: Row[][] })
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
                rowObject[col.name] = row[colIndex]
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

    public getChartData(chartType: keyof typeof SupportedChartTypes, column: app.DataRequestDataColumn, groupBy?: app.DataRequestDataColumn | null) {
        
        // Categories used as X axis labels
        let categories = Array.from(this.getUniqueValuesFromColumn(column.name))//.map(String)
        
            // Sort categories by length so that the longest appear last. This is because of
            // the angle that is sometimes used to render axis labels which could result in
            // truncating the first label if it is too long.
            // .sort((a, b) => a.length - b.length);
        // console.log(categories)

        let series: Highcharts.SeriesOptionsType[] = [];

        // Simple case: Y = count; X = column.name
        if (!groupBy) {
            const rows = this.pick([ column.name ]).rows
            series = [{
                // @ts-ignore
                type: chartType,
                name: column.label,
                showInLegend: true,
                // @ts-ignore
                edgeColor: "rgba(0, 0, 0, 0.1)",
                tooltip: {
                    headerFormat: `<table><tr><td style="text-align: right">{series.name}:</td><td><b>{point.key}</b></td></tr>`,
                    pointFormat : `<tr><td style="text-align: right">Count:</td><td><b>{point.y}</b></td></tr>`,
                    footerFormat: '</table>',
                },
                data: rows
                    
                    // Sort rows so that they appear in the categories order
                    .sort((a, b) => categories.indexOf(a[column.name] + "") - categories.indexOf(b[column.name] + ""))
                    .map(row => ({ y: row.cnt, name: row[column.name] + "" }))
            }];
        }

        // Complex case: Y = count; X = column.name, groupBy
        else {
            let groups = Array.from(this.getUniqueValuesFromColumn(groupBy.name))//.map(String)

            
            // @ts-ignore
            series = groups.map(groupName => ({
                type: chartType,
                name: groupName,
                // @ts-ignore
                edgeColor: "rgba(0, 0, 0, 0.1)",
                tooltip: {
                    headerFormat: `<table><tr><td style="text-align: right">${column.label || column.name}:</td><td><b>{point.key}</b></td></tr>`,
                    pointFormat : `<tr><td style="text-align: right">${groupBy.label || groupBy.name}:</td><td><b>{series.name}</b></td></tr>` +
                                  `<tr><td style="text-align: right">Count:</td><td><b>{point.y}</b></td></tr>`,
                    footerFormat: '</table>',
                },
                data: categories.map((category, index) => {
                    const row = this.rows.filter(r => {
                        for (let key in r) {
                            if (key === "cnt" || key === "queryid") continue
                            if (key !== column.name && key !== groupBy.name && !PowerSet.isEmpty(r[key])) {
                                return false
                            }
                        }
                        return (
                            r[column.name ] === category &&
                            r[groupBy.name] === groupName
                        )
                    })[0];
                        
                    if (row) {
                        return { y: row.cnt, name: row[column.name] + "" }
                    }
                    return { y: 0, name: category }
                })
            }))
        }

        return {
            categories: categories.map(String),
            series
        };
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

    public filter(filter: (row: Row, rowIndex: number) => boolean): PowerSet {
        const rows: Row[] = this.rows.filter((row, index) => filter(row, index))
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

        this.rows.sort((a, b) => {
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

        return this;//new PowerSet(this.cols, rows, this.countColumn)
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

