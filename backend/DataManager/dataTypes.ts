import { bool } from "../lib"
export { bool } from "../lib"

export const DATA_TYPES = {
    "integer"        : int,
    "float"          : float,
    "string"         : String,
    "boolean"        : bool,
    "day"            : day,
    "week"           : week,
    "month"          : month,
    "year"           : year,
    "date:YYYY-MM-DD": day,
    "date:YYYY wk W" : week,
    "date:YYYY-MM"   : month,
    "date:YYYY"      : year
};

export function int(x: any): number | null {
    x = parseInt(x + "", 10);
    if (isNaN(x) || !isFinite(x)) {
        x = null;
    }
    return x
}

export function float(x: any): number | null {
    x = parseFloat(x + "");
    if (isNaN(x) || !isFinite(x)) {
        x = null;
    }
    return x
}

/**
 * @param dateString YYYY-MM-DD
 * @returns YYYY-MM-DD string or null
 */
export function day(dateString: string): string | null {
    return dateString || null
}

/**
 * @param dateString YYYY-MM-DD
 * @returns YYYY-MM-DD string or null
 */
export function week(dateString: string) {
    return dateString || null
}

/**
 * @param dateString YYYY-MM-DD
 * @returns YYYY-MM-01 string or null
 */
export function month(dateString: string) {
    return dateString || null
}

/**
 * @param dateString YYYY-MM-DD
 * @returns YYYY-01-01 string or null
 */
export function year(dateString: string) {
    return dateString || null
}

export function evaluate(value: string, dataType: keyof typeof DATA_TYPES) {
    const fn = DATA_TYPES[dataType];
    if (!fn) {
        throw new Error(`Unknown data type "${dataType}"`)
    }
    return fn(value)
}

export const string = String
