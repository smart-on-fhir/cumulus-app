import { debuglog } from "util"


export const log     = debuglog("app-log")
export const sql     = debuglog("app-sql")
export const info    = debuglog("app-info")
export const warn    = debuglog("app-warn")
export const debug   = debuglog("app-debug")
export const verbose = debuglog("app-verbose")
export const error   = debuglog("app-error")
