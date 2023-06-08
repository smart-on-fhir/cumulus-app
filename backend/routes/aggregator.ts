
import express, { Request, Response } from "express"
import https, { RequestOptions } from "https"
import { rw } from "../lib"
import config from "../config"
import { requireAuth } from "../controllers/Auth"


const router = express.Router({ mergeParams: true })


// These are the only paths we recognize and proxy to the aggregator
const AGGREGATOR_PATHS = [
    
    // metadata
    "/metadata/:site/:study/:subscription",
    "/metadata/:site/:study",
    "/metadata/:site",
    "/metadata",

    // subscriptions
    "/subscriptions",

    // chart-data
    "/chart-data/:subscription_name",

    // study-periods
    "/study-periods/:site/:study",
    "/study-periods/:site",
    "/study-periods",
];

router.get(AGGREGATOR_PATHS, requireAuth(), rw(async (req: Request, res: Response) => {

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
            "x-api-key": apiKey
        }
    }

    https.get(requestOptions, aggRes => aggRes.pipe(res));
}))

export default router
