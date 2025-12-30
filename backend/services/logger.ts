import { debuglog } from "util";
import { Roarr }    from 'roarr';

const logger = Roarr.child({});

export const error = (...args: any[]) => {
    if (debuglog("app-error").enabled) {
        logger.error.apply(logger, args);
    }
};

export const info = (...args: any[]) => {
    if (debuglog("app-info").enabled) {
        logger.info.apply(logger, args);
    }
};

export const warn = (...args: any[]) => {
    if (debuglog("app-warn").enabled) {
        logger.warn.apply(logger, args);
    }
};

export const debug = (...args: any[]) => {
    if (debuglog("app-debug").enabled) {
        logger.debug.apply(logger, args);
    }
};

export const verbose = (...args: any[]) => {
    if (debuglog("app-verbose").enabled) {
        logger.trace.apply(logger, args);
    }
};

export const log = info;

export const sql = (sql: string, time?: number, meta?: Record<string, any>) => {
    if (debuglog("app-sql").enabled) {
        logger.debug(
            'SQL: %s in %sms %s',
            JSON.stringify(meta?.user?.role || "anonymous"),
            Number(time).toLocaleString(),
            sql.replace(/;+$/, "") + ";"
        );
    }
};
