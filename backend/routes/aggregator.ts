
import express, { Request, Response } from "express"
import https, { RequestOptions }      from "https"
import { rw }                         from "../lib"
import config                         from "../config"


export const router = express.Router({ mergeParams: true })


// These are the only paths we recognize and proxy to the aggregator
const AGGREGATOR_PATHS = [
    
    // metadata
    "/metadata/:site/:study/:subscription",
    "/metadata/:site/:study",
    "/metadata/:site",
    "/metadata",

    // subscriptions
    "/data_packages",

    // chart-data
    "/chart-data/:subscription_name",

    // study-periods
    "/study-periods/:site/:study",
    "/study-periods/:site",
    "/study-periods",
];

router.get(AGGREGATOR_PATHS, rw(async (req: Request, res: Response) => {

    // TODO: Request appropriate permissions

    const { enabled, apiKey, baseUrl } = config.aggregator

    if (!enabled || !apiKey || !baseUrl) {
        return res.status(400).type("text").end("The aggregator API is not enabled")
    }

    const { port, hostname } = new URL(baseUrl + req.url);

    const requestOptions: RequestOptions = {
        host: hostname,
        port: port || undefined,
        path: req.url,
        headers: {
            Host: hostname,
            "x-api-key": apiKey,
            accept: "application/json"
        }
    }

    https.get(requestOptions, aggRes => {
        res.header(aggRes.headers)
        res.status(aggRes.statusCode!)
        aggRes.pipe(res)
    });
}))

export default router
