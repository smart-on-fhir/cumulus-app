import crypto                         from "crypto"
import express, { Request, Response } from "express"
import https, { RequestOptions }      from "https"
import { rw }                         from "../lib"
import config                         from "../config"


export const router = express.Router({ mergeParams: true })

const startTime = Date.now()

// These are the only paths we recognize and proxy to the aggregator
const AGGREGATOR_PATHS = [
    
    // metadata
    "/metadata/:site/:study/:subscription",
    "/metadata/:site/:study",
    "/metadata/:site",
    "/metadata",

    // subscriptions
    "/data_packages",
    "/data_packages/:id",

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

    const { port, hostname, href } = new URL(baseUrl + req.url);

    // Cache -------------------------------------------------------------------
    const cacheKey = crypto.createHash("sha1").update([href, startTime].join("-")).digest("hex");

    res.setHeader('Cache-Control', `max-age=31536000, no-cache`)
    res.setHeader('Vary', 'Origin, ETag')
    res.setHeader('ETag', cacheKey)

    let ifNoneMatchValue = req.headers['if-none-match']
    if (ifNoneMatchValue && ifNoneMatchValue === cacheKey) {
        res.statusCode = 304
        return res.end()
    }
    // -------------------------------------------------------------------------

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
                res.writeHead(aggRes.statusCode!, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(jsonResponse));
            } catch (error) {
                // If the response is not JSON, return it as a plain string
                res.writeHead(aggRes.statusCode!, { 'Content-Type': 'text/plain' });
                res.end(data);
            }
        });
    });

    // Handle any error during the proxy request
    proxy.on('error', (err) => {
        console.error('Error with proxy request:', err);
        res.writeHead(500);
        res.end('Internal Server Error');
    });

    req.pipe(proxy);
}))

export default router
