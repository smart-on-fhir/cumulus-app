const { transports, format, createLogger } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, splat, cli, printf, timestamp, ms, json } = format;

const combinedLogger = createLogger({
    transports: [
        new DailyRotateFile({
            filename     : '../logs/combined_%DATE%',
            datePattern  : 'YYYY-MM',
            zippedArchive: true,
            maxSize      : '10MB',
            maxFiles     : 5,
            createSymlink: true,
            symlinkName  : "combined.log",
            extension    : ".log",
            level        : "silly",
            json         : true,
            format: combine(
                format(info => info.tags?.includes("SQL") ? false : info)(),
                format.errors({ stack: true }),
                splat(),
                timestamp(),
                ms(),
                json()
            )
        })
    ]
})

const defaultLogger = createLogger({
    transports: [
        new transports.Console({
            handleExceptions: true,
            handleRejections: true,
            level : process.env.LOG_LEVEL || "warn",
            silent: process.env.NODE_ENV === "test",
            format: combine(
                format(info => info.tags?.includes("SQL") || info.tags?.includes("WEB") ? false : info)(),
                splat(),
                format.errors({ stack: true }),
                // printf(info => {
                //     console.log(info)
                //     return ""
                // }),
                // format.errors(),
                // cli(),
                printf(info => {
                    // if (info instanceof Error) {
                    //     return `${info.timestamp} [${info.label}] ${info.level}: ${info.message} ${info.stack}`;
                    // }
                    // if (info.HttpError) {
                    //     return `${info.level.padStart(7)}: ${info.status} ${info.name}`;
                    // }
                    return `${String(info.level).padStart(18, " ")}: ${info.message}`
                }),
                cli({ message: true, level: true }),
                // format.colorize(),
                
                // printf(info => info[Symbol.for('message')]),
            )
        }),

        new transports.Stream({
            level : "silly",
            stream: combinedLogger
        }),

        // ACCESS LOG ----------------------------------------------------------
        new DailyRotateFile({
            filename     : '../logs/access_%DATE%',
            datePattern  : 'YYYY-MM',
            zippedArchive: true,
            maxSize      : '10MB',
            maxFiles     : 5,
            extension    : ".log",
            level        : "verbose",
            format: combine(
                format(info => info.tags?.includes("WEB") ? info : false)(),
                // splat(),
                timestamp(),
                // ms(),
                // json(),
                // format.prettyPrint(),
                // format.printf(m => `${m.timestamp} ${m.ms} ${m.level}: ${m.message}`)
                format.printf(({ message, timestamp, ...rest }) => `${timestamp} ${message} ${JSON.stringify(rest)}`)
                // format.printf(({ message, timestamp }) => `${timestamp} ${message}`)
            )
        }),

        // ERROR LOG -----------------------------------------------------------
        new DailyRotateFile({
            filename: '../logs/error_%DATE%',
            datePattern: 'YYYY-MM',
            zippedArchive: true,
            maxSize: '10MB',
            maxFiles: 5, // '14d',
            extension: ".log",
            level: "warn",
            handleExceptions: true,
            handleRejections: true,
            format: combine(
                format.errors({ stack: true }),
                splat(),
                timestamp(),
                ms(),
                format.printf(m => `${m.timestamp} ${m.ms} ${m.level}: ${m.message}`)
            )
        }),

        // SQL LOG -------------------------------------------------------------
        new DailyRotateFile({
            filename     : '../logs/sql_%DATE%',
            datePattern  : 'YYYY-MM',
            zippedArchive: true,
            maxSize      : '10MB',
            maxFiles     : 5,
            extension    : ".log",
            level        : "silly",
            format: combine(
                format(info => info.tags?.includes("SQL") ? info : false)(),
                timestamp(),
                ms(),
                // simple()
                // format.printf(({ message, ...rest }) => `${message} ${JSON.stringify(rest)}`)
                format.printf(m => `${m.timestamp} ${m.ms}`.padEnd(34) + m.message)
            )
        })
    ],
    // exitOnError: false,
    silent: false,
    defaultMeta: {}
})

// const orig = defaultLogger.error
// defaultLogger.error = (ex, meta) => {
//     if (ex instanceof Error) {
//         // return orig(inspect(ex, true), ...rest)
//         if (meta) {
//             return orig(ex.message, { ...meta, ...ex, stack: ex.stack})
//         }
//         return orig(ex.message, { ...ex, stack: ex.stack })
//     }
//     return orig(ex, meta)
// }

module.exports = {
    logger: defaultLogger,
    combinedLogger
}