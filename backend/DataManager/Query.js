const { QueryTypes, Sequelize } = require("sequelize");

const FilterConfig = {
    eq : col => `"${col}" = ?` ,
    ne : col => `"${col}" != ?`,
    gt : col => `"${col}" > ?` ,
    gte: col => `"${col}" >= ?`,
    lt : col => `"${col}" < ?` ,
    lte: col => `"${col}" <= ?`,

    strEq          : col => `"${col}" LIKE ?`,
    strContains    : col => `"${col}" ILIKE concat('%', ?, '%')`,
    strStartsWith  : col => `"${col}" LIKE concat(?, '%')`,
    strEndsWith    : col => `"${col}" LIKE concat('%', ?)`,
    matches        : col => `"${col}" ~ ?`, 
    strEqCI        : col => `"${col}" ILIKE ?`,
    strContainsCI  : col => `"${col}" ILIKE concat('%', ?, '%')`,
    strStartsWithCI: col => `"${col}" ILIKE concat(?, '%')`,
    strEndsWithCI  : col => `"${col}" ILIKE concat('%', ?)`,
    matchesCI      : col => `"${col}" ~* ?`,
    
    sameDay  : col => `date_trunc('day', "${col}") = date_trunc('day', TIMESTAMP '?')`,
    sameMonth: col => `date_trunc('month', "${col}") = date_trunc('month', TIMESTAMP '?')`,
    sameYear : col => `date_trunc('year', "${col}") = date_trunc('year', TIMESTAMP '?')`,
    
    // { id: "sameDayOrBefore"  , label: "Same date or before" , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "day"  ) },
    // { id: "sameDayOrAfter"   , label: "Same date or after"  , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "day"  ) },
    // { id: "sameMonthOrBefore", label: "Same month or before", type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "month") },
    // { id: "sameMonthOrAfter" , label: "Same month or after" , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "month") },
    // { id: "sameYearOrBefore" , label: "Same year or before" , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "year" ) },
    // { id: "sameYearOrAfter"  , label: "Same year or after"  , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "year" ) },
    // { id: "beforeDay"        , label: "Before date"         , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "day"  ) },
    // { id: "afterDay"         , label: "After date"          , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "day"  ) },
    // { id: "beforeMonth"      , label: "Before month"        , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "month") },
    // { id: "afterMonth"       , label: "After month"         , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "month") },
    // { id: "beforeYear"       , label: "Before year"         , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "year" ) },
    // { id: "afterYear"        , label: "After year"          , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "year" ) },
    
    isTrue    : col => `"${col}" IS TRUE`,
    isNotTrue : col => `"${col}" IS NOT TRUE`,
    isFalse   : col => `"${col}" IS FALSE`,
    isNotFalse: col => `"${col}" IS NOT FALSE`,
    isNull    : col => `"${col}" IS NULL`,
    isNotNull : col => `"${col}" IS NOT NULL`,
};


class Query {

    /**
     * @type {string[]}
     */
    #columns;

    /**
     * @type {string[]}
     */
    #allColumns;

    #table = "";

    #where = "";

    #whereJoin = "AND"

    /**
     * @type {string[]}
     */
    #order;

    /**
     * @type {(string|number|boolean|Date|null)[]}
     */
    #replacements;

    constructor() {
        this.#columns      = [];
        this.#order        = [];
        this.#replacements = [];
        this.#allColumns   = [];
    }

    /**
     * @param {...string} columns 
     */
    addColumns(...columns) {
        this.#columns.push(...columns);
        this.#allColumns.push(...columns);
        return this;
    }

    /**
     * @param {string} name
     */
    setTable(name) {
        this.#table = name;
        return this;
    }

    /**
     * @param {"AND"|"OR"} whereJoin 
     * @param {string} left 
     * @param {string} [operator] 
     * @param {*} [right] 
     * @returns {Query}
     */
    #addWhere(whereJoin, left, operator, right) {
        let str;
        if (operator === undefined) {
            str = left
        } else {
            str = right === undefined ? `"${left}" ${operator}` : `"${left}" ${operator} ?`
        }
        if (!this.#where) {
            this.#where = str
        } else {
            if (this.#whereJoin !== whereJoin) {
                this.#where = `(${this.#where}) ${whereJoin} ${str}`
            } else {
                this.#where += ` ${whereJoin} ${str}`
            }
        }
        this.#whereJoin = whereJoin
        if (right) {
            this.#replacements.push(right)
        }
        if (!this.#allColumns.includes(left)) {
            this.#allColumns.push(left);
        }
        return this
    }

    /**
     * @param {string} left 
     * @param {string} operator 
     * @param {*} [right] 
     * @returns {Query}
     */
    where(left, operator, right) {
        return this.#addWhere("AND", left, operator, right)
    }

    /**
     * @param {string} left 
     * @param {string} operator 
     * @param {*} [right] 
     * @returns {Query}
     */
    andWhere(left, operator, right) {
        return this.#addWhere("AND", left, operator, right)
    }
    
    /**
     * @param {string} left 
     * @param {string} operator 
     * @param {*} [right] 
     * @returns {Query}
     */
    orWhere(left, operator, right) {
        return this.#addWhere("OR", left, operator, right)
    }

    /**
     * @param {string[]} allColumns 
     */
    whiteList(allColumns) {
        allColumns.forEach(c => {
            this.andWhere(c, this.#allColumns.includes(c) ? "IS NOT NULL" : "IS NULL")
        });
        return this;
    }

    /**
     * @param {...string} filters
     */
    filter(...filters) {
        filters.forEach(f => {
            f.split(/\s*,\s*/).filter(Boolean).forEach((cond, i) => {
                const parts = cond.split(":");
                if (parts.length < 2) {
                    throw new Error("Each filter must have at least 2 parts");
                }
                
                const [left, operator, right] = parts;
                
                if (typeof FilterConfig[operator] !== "function") {
                    throw new Error(`Filter operator "${operator}" is not implemented`);
                }

                this.#addWhere(i ? "OR" : "AND", FilterConfig[operator](left));

                if (!this.#allColumns.includes(left)) {
                    this.#allColumns.push(left)
                }
                
                if (right) {
                    this.#replacements.push(right)
                }
            });
        });
        return this
    }

    /**
     * @param {string} col 
     * @param {"ASC"|"DESC"} [dir]
     * @returns {Query}
     */
    order(col, dir = "ASC") {
        this.#order.push(`"${col}" ${dir === "ASC" ? "ASC" : "DESC"}`);
        return this;
    }

    compileWhere() {
        return this.#where ? `WHERE ${this.#where}` : ""
    }

    compileOrder() {
        return this.#order.length ? `ORDER BY ${this.#order.join(", ")}` : ""
    }

    /**
     * @returns {[string, any[]]}
     */
    compile() {
        let sql = `SELECT ${this.#columns.map(c => c.match(/^\s*[^\s]+\s*$/) ? `"${c.trim()}"` : c)
        } FROM "${this.#table}" ${this.compileWhere()} ${this.compileOrder()}`;
        return [sql, this.#replacements];
    }

    /**
     * @param {Sequelize} connection
     * @returns {Promise<Record<string, any>[]>}
     */
    execute(connection) {
        const [sql, replacements] = this.compile()
        return connection.query(sql, {
            replacements,
            logging: console.log,
            type: QueryTypes.SELECT
        });
    }
}

module.exports = Query;
