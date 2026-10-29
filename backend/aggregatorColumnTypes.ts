import { request }                         from "./aggregator"
import { NAMESPACE_PREFIX }                from "./DataManager/dataTypes"
import type { DataPackage, DataPackageColumn } from "./routes/aggregator"

/**
 * TEMPORARY: overrides for column types the aggregator reports.
 *
 * The aggregator's declared types can't be trusted yet. Core studies, for
 * example, report `age` as a string even though its values are whole numbers.
 * Until the types are reliable, a column's name is used to guess a better
 * type, and the guess is kept only if every value in the package's data fits
 * it. The name alone is not enough: it says what a column measures, not how its
 * values are written. `event_free_survival_years` is measured in years but
 * holds ">=5", and `valid_birth_date` holds booleans.
 *
 * To remove once the aggregator types are trustworthy: delete this file and
 * the `verifyColumnTypes` call in routes/aggregator.ts.
 */

const KEYWORDS: [RegExp, string][] = [
    [/(?:\b|_)(group|range)(?:\b|_)/i                , 'string' ],
    [/(?:\b|_)year(?:\b|_)/i                         , 'date:YYYY'],
    [/(?:\b|_)month(?:\b|_)/i                        , 'date:YYYY-MM'],
    [/(?:\b|_)(week|day|date)(?:\b|_)/i              , 'date:YYYY-MM-DD'],
    [/(?:\b|_)(age|days|years|months|weeks)(?:\b|_)/i, 'integer'],
    [/(?:\b|_)(daily|yearly|monthly|weekly)(?:\b|_)/i, 'integer'],
    [/(?:\b|_)(period|ordinal|count|cnt)(?:\b|_)/i   , 'integer'],
    [/(?:\b|_)(int|integer)(?:\b|_)/i                , 'integer'],
    [/(?:\b|_)float(?:\b|_)/i                        , 'float'  ],
    [/(?:\b|_)(bool|boolean)(?:\b|_)/i               , 'boolean'],
    [/^(is|has|not|was)(?:\b|_)/i                    , 'boolean'],
];

/**
 * Strict on purpose. The parsers in DataManager/dataTypes coerce rather than
 * validate (`int("5+")` is 5), which would wave through exactly the values this
 * check exists to catch.
 */
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/

const PATTERNS: Record<string, RegExp> = {
    "integer"        : /^[+-]?\d+$/,
    "float"          : /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/,
    "boolean"        : /^(true|false)$/i,
    "date:YYYY"      : DATE,
    "date:YYYY-MM"   : DATE,
    "date:YYYY-MM-DD": DATE
};

/** The type a column's name suggests, if any. */
export function guessDataType(name: string): string | undefined {
    for (const [re, dataType] of KEYWORDS) {
        if (re.test(name)) {
            return dataType
        }
    }
}

/**
 * Whether every value can be read as `dataType`. Nulls (the cube's "all" rows),
 * empty strings and `cumulus__` placeholders say nothing about the type and are
 * skipped, but at least one real value is required: an empty column proves
 * nothing, so it keeps its declared type.
 */
export function fitsDataType(dataType: string, values: unknown[]): boolean {

    // Anything can be shown as a string, so that guess needs no proof
    if (dataType === "string") {
        return true
    }

    const pattern = PATTERNS[dataType]
    if (!pattern) {
        return false
    }

    let seen = 0

    for (const value of values) {
        if (value === null || value === undefined || value === "") {
            continue
        }

        const text = String(value)

        if (text.startsWith(NAMESPACE_PREFIX)) {
            continue
        }

        if (!pattern.test(text)) {
            return false
        }

        seen++
    }

    return seen > 0
}

/** Columns whose name suggests a type other than the one already assigned. */
export function guessedOverrides(columns: Record<string, DataPackageColumn>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [name, col] of Object.entries(columns)) {
        const guess = guessDataType(name)
        if (guess && guess !== col.dataType) {
            out[name] = guess
        }
    }
    return out
}

/** The guesses that every value in the data agrees with. */
export function confirmedOverrides(guesses: Record<string, string>, rows: Record<string, unknown>[]): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [name, dataType] of Object.entries(guesses)) {
        if (fitsDataType(dataType, rows.map(row => row[name]))) {
            out[name] = dataType
        }
    }
    return out
}

async function loadRows(pkg: DataPackage): Promise<Record<string, unknown>[]> {
    if (!pkg.s3_path) {
        return []
    }

    const { response, body: raw } = await request(`/from-parquet/?s3_path=${encodeURIComponent(pkg.s3_path)}`)

    // The JSON may arrive without a JSON content type, and come back as text
    const body = typeof raw === "string" && response.ok ? JSON.parse(raw) : raw

    if (!response.ok || !Array.isArray(body?.data)) {
        throw new Error(`Unable to load the data for ${pkg.id} (${response.status})`)
    }

    return body.data
}

/**
 * Package versions never change once published, so each one is checked once
 * per process and the result reused.
 */
const verified = new Map<string, Promise<Record<string, string>>>()

/**
 * Applies the name-based guesses that the package's own data confirms. The data
 * is only fetched when some guess actually needs checking. If it can't be
 * loaded, the declared types are used unchanged.
 */
export async function verifyColumnTypes(pkg: DataPackage): Promise<DataPackage> {
    const guesses = guessedOverrides(pkg.columns)

    if (!Object.keys(guesses).length) {
        return pkg
    }

    let pending = verified.get(pkg.id)

    if (!pending) {
        const needsData = Object.values(guesses).some(dataType => dataType !== "string")
        pending = (needsData ? loadRows(pkg) : Promise.resolve([])).then(rows => confirmedOverrides(guesses, rows))
        verified.set(pkg.id, pending)
    }

    let overrides: Record<string, string>

    try {
        overrides = await pending
    } catch (error) {
        verified.delete(pkg.id)
        console.error(`Column types for ${pkg.id} could not be verified:`, error)
        return pkg
    }

    return {
        ...pkg,
        columns: Object.fromEntries(Object.entries(pkg.columns).map(([name, col]) => [
            name,
            overrides[name] ? { ...col, dataType: overrides[name] } : col
        ]))
    }
}
