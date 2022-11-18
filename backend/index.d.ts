import { Options } from "sequelize";

interface Config {
    port    : number
    host    : string
    verbose : boolean
    throttle: number
    appEmail: string

    // When line-level data is requested, the email is sent to this address.
    // Typically, this would represent a subscription group that handles for
    // example "MA DPH Subscriptions to the Massachusetts regional cluster"
    regionalClusterEmail: string

    // When new data requests (and/or subscriptions) are created, notification
    // emails are sent to this address
    cumulusAdminEmail: string

    docker: {
        containerName: string
        dataDir: string
    },
    db: {
        sync: "none" | "normal" | "force" | "alter"
        seed: string
        options: Options
    },
    mailGun: {
        apiKey: string
        domain: string
        [key: string]: any
    }
}
