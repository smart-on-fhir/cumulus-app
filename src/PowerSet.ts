interface Row {
    "<sum>": number
    [key: string]: string | boolean | number | null
}

interface InputData<RowType = Row> {
    cols: app.DataRequestDataColumn[]
    rows: RowType[][]
}

export default class PowerSet<RowType extends Row>
{
    cols: app.DataRequestDataColumn[] = []

    rows: RowType[] = []

    countColumn: keyof RowType

    constructor(cols: app.DataRequestDataColumn[], rows: RowType[], countColumn: keyof RowType = "cnt")
    {
        this.cols = cols
        this.rows = rows
        this.countColumn = countColumn
    }

    static from<RowType extends Row>(data: InputData, countColumn: string = "cnt")
    {
        const cols = data.cols
        const rows: RowType[] = []
        
        data.rows.forEach(row => {
            const rowObject: any = {}
            data.cols.forEach((col, colIndex) => {
                rowObject[col.name] = row[colIndex]
            })
            rows.push(rowObject)
        })

        return new PowerSet(cols, rows, countColumn)
    }

    filter(filter: (row: RowType, rowIndex: number) => boolean)
    {
        const rows: RowType[] = this.rows.filter((row, index) => filter(row, index))
        return new PowerSet(this.cols, rows, this.countColumn)
    }

    sort(by: keyof RowType, dir: "asc"|"desc" = "asc")
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

    count(filter: (row: RowType, rowIndex: number) => boolean = () => true)
    {
        let rows = this.filter(filter).rows

        if (!rows.length) {
            return -1;
        }

        return rows.reduce((prev, curr) => prev + (+curr[this.countColumn]), 0)
    }

    group(by: keyof RowType, postProcess?: (groups: Record<string, number>) => Record<string, number>)
    {
        const groups: Record<string, number> = {}
        
        this.rows.forEach(row => {
            const value = row[by]
            const count = row[this.countColumn]

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
     * group2("age") -> {
     *     age: {
     *         <sum>: number
     *     }
     * }[]
     * 
     * group2("age", "gender") -> {
     *     age: {
     *         male: number,
     *         female: number,
     *         null: number
     *     }
     * }[]
     */
    group2(by: keyof RowType, stratify: keyof RowType = "")
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
