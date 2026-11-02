import { app }             from "../../types"
import { assert }          from "../../utils"
import { TURBO_THRESHOLD } from "./config"


export function isTurbo(primaryData: app.ServerResponses.DataResponse, secondaryData?: app.ServerResponses.StratifiedDataResponse | null) {
    let out = false

    if (!primaryData.stratifier) {
        out = primaryData.data?.[0]?.rows?.length > TURBO_THRESHOLD
    } else {
        out = (primaryData as app.ServerResponses.StratifiedDataResponse).data.some(g => g.rows.length > TURBO_THRESHOLD)
    }

    if (!out && secondaryData) {
        out = secondaryData.data.some(g => g.rows.length > TURBO_THRESHOLD)
    }
    
    return out
}

export function hasRanges(data: app.ServerResponses.DataResponse | null, data2: app.ServerResponses.StratifiedDataResponse | null) {
    return (
        (data?.data?.some(group => group.rows.some(row => row.length >= 4))) ||
        (data2?.data?.some(group => group.rows.some(row => row.length >= 4)))
    );
}

export function validateData(data: any, { column, stratifier }: { column: string, stratifier?: string, filters?: string[] }) {

    type Point = [string | number, number] | [string | number, number, number, number];

    // response data type
    assert(data && typeof data === "object", `Invalid data response received: type "${typeof data}"`)
    
    // column
    assert(data.column === column, `Invalid data response received: Expected the "column" property to equal "${column}".`)

    // stratifier
    if (stratifier) {
        assert(data.stratifier === stratifier, `Invalid data response received: Expected the "stratifier" property to equal "${stratifier}".`)
    }
    
    // totalCount
    assert(typeof data.totalCount === "number", `Invalid data response received: Expected numeric "totalCount" property.`)
    
    // rowCount
    assert(typeof data.rowCount === "number", `Invalid data response received: Expected numeric "rowCount" property.`)

    // filters
    assert(Array.isArray(data.filters), `Invalid data response received: Expected "filters" to be array.`)

    // data
    assert(Array.isArray(data.data), `Invalid data response received: Expected "data" to be array.`)

    // Singular response
    if (!stratifier) {
        assert(data.data.length === 1, `Invalid data response received: Expected the "data" array to contain one entry.`)
        assert(typeof data.data[0] === "object", `Invalid data response received: Expected the "data" array to contain one object.`)
        assert(Array.isArray(data.data[0].rows), `Invalid data response received: Expected data[0].rows to be array.`)
        assert(data.data[0].rows.length === data.rowCount, `Invalid data response received: Expected data[0].rows to have length equal to "rowCount".`)

        data.data[0].rows.forEach((row: Point, i: number) => {
            assert(typeof row[1] === "number", `Invalid data response received: data[0].rows[${i}][1] must be a number`)
            assert(row.length === 2 || typeof row[2] === "number", `Invalid data response received: data[0].rows[${i}][2] must be a number`)
            assert(row.length === 2 || typeof row[3] === "number", `Invalid data response received: data[0].rows[${i}][3] must be a number`)
            if (i > 0 && typeof row[0] === "number") {
                assert(
                    row[0] > data.data[0].rows[i-1][0],
                    `Invalid data response received: Data is not sorted: ${row[0]} > ${data.data[0].rows[i-1][0]}`
                )
            }
        })
    }

    // Stratified response
    else {
        const stratifiers: Record<string, boolean> = {}

        data.data.forEach((group: any, g: number) => {
            assert(group && typeof group === "object", `Invalid data response received: data[${g}] is not an object.`)
            assert(Array.isArray(group.rows), `Invalid data response received: data[${g}].rows is not an array.`)
            assert(!stratifiers[group.stratifier], `Invalid data response received: Duplicate stratifier "${group.stratifier}".`)
            stratifiers[group.stratifier] = true;

            group.rows.forEach((row: Point, i: number) => {
                assert(typeof row[1] === "number", `Invalid data response received: data[${g}].rows[${i}][1] must be a number`)
                assert(row.length === 2 || typeof row[2] === "number", `Invalid data response received: data[${g}].rows[${i}][2] must be a number`)
                assert(row.length === 2 || typeof row[3] === "number", `Invalid data response received: data[${g}].rows[${i}][3] must be a number`)
                if (i > 0 && typeof row[0] === "number") {
                    assert(row[0] >= group.rows[i-1][0], `Invalid data response received: data[${g}].rows is not sorted`)
                }
            })
        })
    }
}
