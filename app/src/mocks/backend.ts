const DB = {
    VIEWS: {
        Patients_by_Age_and_Gender: {
            name: "Patients by Age and Gender",
            query: `select age, gender, count(distinct subject_id) as cnt
                from view_patient
                group by CUBE (age, gender)
                having count(distinct subject_id) > 10
                order by age, gender;`,

            data: {
                cols: [
                    {
                        name: "age",
                        label: "Patient Age",
                        description: "Patient Age in Years",
                        dataType: "integer"
                    },
                    {
                        name: "gender",
                        label: "Patient Gender",
                        description: "Patient Gender",
                        dataType: "string"
                    },
                    {
                        name: "cnt",
                        label: "Count",
                        description: "Count",
                        dataType: "integer"
                    }
                ],
                rows: [
                    // age, gender  , cnt
                    [ 3   , null    , 13   ],
                    [ 6   , null    , 11   ],
                    [ 8   , null    , 12   ],
                    [ 9   , null    , 14   ],
                    [ 11  , null    , 14   ],
                    [ 14  , null    , 16   ],
                    [ 16  , "male"  , 17   ],
                    [ 16  , null    , 22   ],
                    [ 17  , "female", 15   ],
                    [ 17  , null    , 24   ],
                    [ 18  , null    , 14   ],
                    [ 21  , null    , 15   ],
                    [ 22  , null    , 11   ],
                    [ 23  , "female", 12   ],
                    [ 23  , null    , 18   ],
                    [ 24  , "female", 12   ],
                    [ 24  , null    , 19   ],
                    [ 26  , null    , 13   ],
                    [ 27  , "male"  , 13   ],
                    [ 27  , null    , 19   ],
                    [ 28  , "male"  , 13   ],
                    [ 28  , null    , 20   ],
                    [ 29  , null    , 16   ],
                    [ 30  , "male"  , 12   ],
                    [ 30  , null    , 20   ],
                    [ 32  , null    , 11   ],
                    [ 33  , null    , 11   ],
                    [ 35  , "male"  , 15   ],
                    [ 35  , null    , 24   ],
                    [ 36  , "female", 13   ],
                    [ 36  , null    , 17   ],
                    [ 38  , "female", 15   ],
                    [ 38  , null    , 17   ],
                    [ 39  , null    , 13   ],
                    [ 40  , null    , 14   ],
                    [ 41  , null    , 14   ],
                    [ 42  , null    , 15   ],
                    [ 43  , null    , 14   ],
                    [ 44  , null    , 11   ],
                    [ 45  , null    , 14   ],
                    [ 46  , "male"  , 12   ],
                    [ 46  , null    , 19   ],
                    [ 47  , null    , 14   ],
                    [ 48  , null    , 17   ],
                    [ 49  , null    , 13   ],
                    [ 50  , "female", 11   ],
                    [ 50  , null    , 17   ],
                    [ 51  , null    , 19   ],
                    [ 52  , "female", 12   ],
                    [ 52  , "male"  , 11   ],
                    [ 52  , null    , 23   ],
                    [ 53  , null    , 15   ],
                    [ 54  , null    , 16   ],
                    [ 55  , null    , 15   ],
                    [ 56  , null    , 15   ],
                    [ 57  , null    , 17   ],
                    [ 58  , null    , 11   ],
                    [ 59  , null    , 12   ],
                    [ 60  , "female", 12   ],
                    [ 60  , "male"  , 18   ],
                    [ 60  , null    , 30   ],
                    [ 61  , null    , 12   ],
                    [ 62  , "female", 11   ],
                    [ 62  , null    , 17   ],
                    [ 63  , "female", 11   ],
                    [ 63  , null    , 16   ],
                    [ 64  , "male"  , 13   ],
                    [ 64  , null    , 23   ],
                    [ 65  , null    , 11   ],
                    [ 66  , null    , 12   ],
                    [ 68  , "female", 11   ],
                    [ 68  , null    , 19   ],
                    [ 69  , null    , 14   ],
                    [ 70  , "male"  , 15   ],
                    [ 70  , null    , 17   ],
                    [ 76  , null    , 14   ],
                    [ 82  , null    , 13   ],
                    [ null, "female", 568  ],
                    [ null, "male"  , 31   ],
                    [ null, "male"  , 583  ],
                    [ null, null    , 1151 ],
                    [ null, null    , 39   ],

                ]
            }
        },
        // {
        //     name: "COVID-19 Positive test + ICU admissions"
        // },
        // {
        //     name: "Influenza Positive test by phenotype by demographics"
        // },
        // {
        //     name: "HIV Positive case by demographics"
        // }
    }
};

export default DB;

interface Column {
    name: string
    label: string,
    description: string,
    dataType: any
}

interface Row {
    [key: string]: string | boolean | number | null
}

class PowerSet<RowType=Row>
{
    cols: Column[] = []

    rows: RowType[] = []

    countColumn: keyof RowType

    constructor(countColumn: keyof RowType)
    {
        this.countColumn = countColumn
    }

    load(cols: Column[], rows: (string|boolean|number|null)[][])
    {
        this.cols = cols
        
        rows.forEach(row => {
            const rowObject: any = {}
            cols.forEach((col, colIndex) => {
                rowObject[col.name] = row[colIndex]
            })
            this.rows.push(rowObject as RowType)
        })
    }

    filter(filter: (row: RowType, rowIndex: number) => boolean)
    {
        return this.rows.filter((row, index) => filter(row, index))
    }

    count(filter: (row: RowType, rowIndex: number) => boolean = () => true)
    {
        let rows = this.filter(filter)

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
}

class DataSet
{
    powerSet: PowerSet

    constructor(powerSet: PowerSet<any>)
    {
        this.powerSet = powerSet
    }

    get(x: (row: Row) => boolean)
    {
        const rows = this.powerSet.filter(x)
    }
}

// =============================================================================


const set = new PowerSet<{
    gender: "male"|"female"|null
    age: number | null
    cnt: number
}>("cnt")

const view = DB.VIEWS.Patients_by_Age_and_Gender
set.load(view.data.cols, view.data.rows)
// console.log("   male:", set.count(row => row.gender == "male"))
// console.log(" female:", set.count(row => row.gender == "female"))
// console.log("unknown:", set.count(row => row.gender === null))

// console.log("  0-10:", set.count(row => !!row.age && row.age <= 10                 ))
// console.log(" 11-20:", set.count(row => !!row.age && row.age > 10 && row.age <= 20 ))
// console.log(" 21-30:", set.count(row => !!row.age && row.age > 20 && row.age <= 30 ))
// console.log(" 31-40:", set.count(row => !!row.age && row.age > 30 && row.age <= 40 ))
// console.log(" 41-50:", set.count(row => !!row.age && row.age > 40 && row.age <= 50 ))
// console.log(" 51-60:", set.count(row => !!row.age && row.age > 50 && row.age <= 60 ))
// console.log(" 61-70:", set.count(row => !!row.age && row.age > 60 && row.age <= 70 ))
// console.log(" 71-80:", set.count(row => !!row.age && row.age > 70 && row.age <= 80 ))
// console.log(" 81-90:", set.count(row => !!row.age && row.age > 80 && row.age <= 90 ))
// console.log("91-100:", set.count(row => !!row.age && row.age > 90 && row.age <= 100))
// console.log("  100+:", set.count(row => !!row.age && row.age > 100                 ))

// console.log(" boys:", set.count(row => row.gender == "male"   && !!row.age && row.age <= 20))
// console.log("girls:", set.count(row => row.gender == "female" && !!row.age && row.age <= 20))
// console.log("  men:", set.count(row => row.gender == "male"   && !!row.age && row.age >  20))
// console.log("women:", set.count(row => row.gender == "female" && !!row.age && row.age >  20))

// console.log("by gender", set.group("gender"))
// console.log("by age", set.group("age"))
// console.log("by age group", stratifyByAgeGroup(set.group("age")))

// pie by gender
// const pieByGender = new DataSet(set).get(row => row.gender == "male")
// pie by age group
// x = age, y = gender

const dimension1 = {
    column: set.cols.find(col => col.name == "gender")
}
const dimension2 = {
    column: set.cols.find(col => col.name == "cnt")
}



function stratify(data: Record<string, number>, getGroupName: (key: string) => string)
{
    return Object.keys(data).reduce((prev, cur) => {
        let group = getGroupName(cur);
        if (!prev[group]) {
            prev[group] = 0
        }
        prev[group] += +data[cur]
        return prev
    }, {} as any)
}

function stratifyByAgeGroup(data: Record<string, number>)
{
    return stratify(data, key => {
        if (key === null || isNaN(+key) || !isFinite(+key) || +key < 0)
            return "unknown";
        if (+key > 100)
            return "100+";
        if (+key >= 91)
            return "91-100";
        if (+key >= 81)
            return "81-90";
        if (+key >= 71)
            return "71-80";
        if (+key >= 61)
            return "61-70";
        if (+key >= 51)
            return "51-60";
        if (+key >= 41)
            return "41-50";
        if (+key >= 31)
            return "31-40";
        if (+key >= 21)
            return "21-30";
        if (+key >= 11)
            return "11-20";
        return "0-10";
    })
}

