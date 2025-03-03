import express, { Request, Response } from "express"
import https, { RequestOptions }      from "https"
import { cached, rw }                 from "../lib"
import config                         from "../config"
import icd10Catalog                   from "../icd10_hierarchy_count.json"
import loincCatalog                   from "../loinc_tree.json"


export const router = express.Router({ mergeParams: true })


// These are the only paths we recognize and proxy to the aggregator
const AGGREGATOR_PATHS = [
    
    // metadata
    "/metadata/:site/:study/:subscription",
    "/metadata/:site/:study",
    "/metadata/:site",
    "/metadata",

    // subscriptions
    "/data-packages",
    "/data-packages/:id",

    // chart-data
    // "/chart-data/:subscription_name",

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

    // Cache for 2 days --------------------------------------------------------
    if (cached(req, res, 7_200, [baseUrl])) {
        return;
    }

    const requestOptions: RequestOptions = {
        host: hostname,
        port: port || undefined,
        path: req.url,
        method: req.method,
        headers: {
            Host: hostname,
            "x-api-key": apiKey,
            accept: "application/json"
        }
    }

    const proxy = https.request(requestOptions, aggRes => {

        let data = '';

        // Receive chunks of data from the external server
        aggRes.on('data', (chunk) => {
            data += chunk; // Buffer the data
        });

        // On response completion
        aggRes.on('end', () => {
            // console.log("%s GOT: %s %s", req.url, aggRes.statusCode, data)
            try {
                // Attempt to parse the data as JSON (if the content is JSON)
                const jsonResponse = JSON.parse(data);

                // Send the JSON response to the client
                res.writeHead(aggRes.statusCode!, { 'Content-Type': 'application/json', "X-Upstream-Host": baseUrl });
                res.end(JSON.stringify(jsonResponse));
            } catch (error) {
                // If the response is not JSON, return it as a plain string
                res.writeHead(aggRes.statusCode!, { 'Content-Type': 'text/plain', "X-Upstream-Host": baseUrl });
                res.end(data);
            }
        });
    });

    // Handle any error during the proxy request
    proxy.on('error', (err) => {
        console.error('Error with proxy request:', err);
        res.writeHead(500, {
            "X-Upstream-Host": baseUrl,
            "Cache-Control"  : "no-cache"
        });
        res.end('Internal Server Error');
    });

    req.pipe(proxy);
}))

router.get("/catalog/icd10", rw(async (req: Request, res: Response) => {
    res.json(icd10Catalog)
}))

router.get("/catalog/loinc", rw(async (req: Request, res: Response) => {
    res.json(loincCatalog)
}))

export default router
