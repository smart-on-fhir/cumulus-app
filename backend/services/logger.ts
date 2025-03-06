import { debuglog } from "util"


export const log     = debuglog("app-log")
export const info    = debuglog("app-info")
export const warn    = debuglog("app-warn")
export const debug   = debuglog("app-debug")
export const verbose = debuglog("app-verbose")
export const error   = debuglog("app-error")

const logSql = debuglog("app-sql")

export const sql = (sql: string, time?: number, meta?: Record<string, any>) => {
    logSql(`${sql.replace(/;+$/, "")}; time: ${Number(time).toLocaleString()
    }ms; replacements: [${meta?.replacements || []}]; role: ${meta?.user?.role}`);
};
