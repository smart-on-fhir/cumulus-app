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

    filter(filter: (row: Row, rowIndex: number) => boolean)
    {
        const rows: Row[] = this.rows.filter((row, index) => filter(row, index))
        return new PowerSet(this.cols, rows)
    }

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

    /**
     * If rows is { age: Number, gender: stringify, cnt: number }[]
     * 
     * group2("age")           => { age: { <sum>: 5 } }[]
     * group2("age", "gender") => { age: { male: 6, female: 2, null: 7 } }[]
     */
    group2(by: keyof Row, stratify: keyof Row = "")
    {
        return groupCountsBy(this.rows, by + "", stratify + "")
        // // { [age: Number]: { gender: number }}[]
        // const groups: Record<string, any> = {}
        
        // // { age: Number, gender: stringify, cnt: number }[]
        // this.rows.forEach(row => {
        //     const label = row[by] + ""
        //     // const count = row[this.countColumn]

        //     if (!groups.hasOwnProperty(String(label))) {
        //         groups[label] = { "<sum>": 0 }
        //     }

        //     if (stratify) {

        //     } else {
        //         groups[label]["<sum>"] += row[this.countColumn]
        //     }

        //     // groups[label].push(row)
        // })

        // return groups
    }
}

function groupCountsBy(rows: Record<string, any>[], by: string, stratify?: string)
{
    const groups: Record<string, any> = {}

    rows.forEach(row => {
        const label = row[by] + ""

        let group = groups[label]

        if (!group) {
            group = groups[label] = stratify ? {} : { "<sum>": 0 }
        }

        if (stratify) {
            const stratifier = row[stratify]
            if (!group[stratifier]) {
                group[stratifier] = 0
            }
            group[stratifier] += row.cnt 
        }
        else {
            group["<sum>"] += row.cnt
        }
    })

    return groups

    // const keys = Object.keys(groups).sort(), out: Record<string, any> = {}

    // keys.forEach(key => out[key] = groups[key]) 

    // return out
}
