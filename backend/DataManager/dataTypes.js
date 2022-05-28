const { bool } = require("../lib");

const DATA_TYPES = {
    "integer": int,
    "float"  : float,
    "string" : String,
    "boolean": bool,
    "day"    : day,
    "week"   : week,
    "month"  : month,
    "year"   : year,
};

/**
 * @param {any} x 
 * @returns {number}
 */
function int(x) {
    x = parseInt(x + "", 10);
    if (isNaN(x) || !isFinite(x)) {
        x = null;
    }
    return x
}

/**
 * @param {any} x 
 * @returns {number}
 */
function float(x) {
    x = parseFloat(x + "");
    if (isNaN(x) || !isFinite(x)) {
        x = null;
    }
    return x
}

/**
 * @param {string} dateString YYYY-MM-DD
 * @returns {string | null} YYYY-MM-DD string or null
 */
function day(dateString) {
    return dateString || null
}

function week(dateString) {
    return dateString || null
}

/**
 * @param {string} dateString YYYY-MM-DD
 * @returns {string | null} YYYY-MM-01 string or null
 */
function month(dateString) {
    return dateString || null
}

/**
 * @param {string} dateString YYYY-MM-DD
 * @returns {string | null} YYYY-01-01 string or null
 */
function year(dateString) {
    return dateString || null
}

/**
 * @param {string} value 
 * @param {keyof typeof DATA_TYPES} dataType 
 */
function evaluate(value, dataType) {
    const fn = DATA_TYPES[dataType];
    if (!fn) {
        throw new Error(`Unknown data type "${dataType}"`)
    }
    return fn(value)
}

module.exports = {
    DATA_TYPES,
    int,
    float,
    bool,
    string: String,
    day,
    week,
    month,
    year,
    evaluate
};
