import moment, { Moment } from "moment"
import { bool }           from "../lib"
export { bool }           from "../lib"


const NAMESPACE_PREFIX = "cumulus__"

function isPrivateValue(x: any) {
    return typeof x === "string" && x.startsWith(NAMESPACE_PREFIX)
}

function createSetter(fn: (x: string) => string) {
    return (x: string | null) => {
        if (x === null || isPrivateValue(x)) {
            return x
        } else {
            return fn(x)
        }
    }
}

function createGetter(fn: (x: string) => any) {
    return (x: string | null) => {
        if (x === null || isPrivateValue(x)) {
            return x
        } else {
            return fn(x)
        }
    }
}

export const DATA_TYPES = {
    "integer": {
        set: createSetter((x: string) => int(x) + ""),
        get: createGetter((x: string) => int(x)),
    },
    "float": {
        set: createSetter((x: string) => float(x) + ""),
        get: createGetter((x: string) => float(x)),
    },
    "boolean": {
        set: createSetter((x: string) => bool(x) + ""),
        get: createGetter((x: string) => bool(x)),
    },
    "string": {
        set: createSetter(String),
        get: createGetter(String),
    },
    "day": {
        set: createSetter((x: string) => date(x).startOf("day").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM-DD")),
    },
    "week": {
        set: createSetter((x: string) => date(x).startOf("week").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM-DD")),
    },
    "month": {
        set: createSetter((x: string) => date(x).startOf("month").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM")),
    },
    "year": {
        set: createSetter((x: string) => date(x).startOf("year").format()),
        get: createGetter((x: string) => date(x).format("YYYY")),
    },
    "date:YYYY-MM-DD": {
        set: createSetter((x: string) => date(x).startOf("day").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM-DD")),
    },
    "date:YYYY wk W": {
        set: createSetter((x: string) => date(x).startOf("week").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM-DD")),
    },
    "date:YYYY-MM": {
        set: createSetter((x: string) => date(x).startOf("month").format()),
        get: createGetter((x: string) => date(x).format("YYYY-MM")),
    },
    "date:YYYY": {
        set: createSetter((x: string) => date(x).startOf("year").format()),
        get: createGetter((x: string) => date(x).format("YYYY")),
    }
};


function int(x: any): number {
    const n = parseInt(x + "", 10);
    if (isNaN(n)) {
        throw new TypeError(`Value ${x} is not an integer`);
    }
    if (!isFinite(n)) {
        throw new TypeError(`Value ${x} is infinite`);
    }
    if (n > Number.MAX_SAFE_INTEGER) {
        throw new TypeError(`Value ${x} is too big`);
    }
    if (n < Number.MIN_SAFE_INTEGER) {
        throw new TypeError(`Value ${x} is too small`);
    }
    return n
}

function float(x: any): number {
    const n = parseFloat(x + "");
    if (isNaN(n)) {
        throw new TypeError(`Value ${x} is not a number`);
    }
    if (!isFinite(n)) {
        throw new TypeError(`Value ${x} is infinite`);
    }
    if (n > Number.MAX_VALUE) {
        throw new TypeError(`Value ${x} is too big`);
    }
    if (n < -Number.MAX_VALUE) {
        throw new TypeError(`Value ${x} is too small (less than ${Number.MIN_VALUE})`);
    }
    return n
}

function date(dateString: string): Moment {
    const date = moment(dateString)
    if (!date.isValid()) {
        throw new TypeError(`Value "${dateString}" is not a valid date"`);
    }
    return date.utc()
}
