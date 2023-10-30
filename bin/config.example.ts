// dbUrl = postgres://user:password@host:port/database

export const SITES = {
    LOCAL: {
        baseUrl: "http://localhost:3000/",
        dbUrl  : "postgres://postgres:cumulus-db-password@localhost:4002/cumulus"
    },
    PROD: {
        baseUrl: "https://prod.cumulus.dev/",
        dbUrl  : "postgres://user:password@host:port/database"
    },
    // more connections here...
}
