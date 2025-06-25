import { join }                          from "path"
import { Request, Response }             from "express"
import makeFetchHappen, { FetchOptions } from "make-fetch-happen"
import config                            from "./config"
import { HttpError, ServiceUnavailable } from "./errors"


const fetch = makeFetchHappen.defaults({
    cachePath: join(__dirname, 'aggregator-cache'), // path where cache will be written (and read)
    cache: "default"
})

function mapCacheControlToFetchOption(req: Request): RequestCache {
    const cc = req.headers['cache-control']?.toLowerCase() || "";
    if (cc.includes('no-store')) return "no-store";
    if (cc.includes('no-cache')) return "reload";
    if (cc.includes('max-age=0') || cc.includes('must-revalidate')) return "reload";
    if (cc.includes('only-if-cached')) return "only-if-cached";
    if (cc.includes('max-age')) return "force-cache";
    return "default";
}

export async function download(req: Request, res: Response) {
    try {
        const { enabled, apiKey, baseUrl } = config.aggregator

        if (!enabled || !apiKey || !baseUrl) {
            throw new ServiceUnavailable("The aggregator API is not enabled")
        }

        const { href } = new URL(baseUrl.replace(/\/$/, "") + req.url);
        
        const { status, headers, body } = await fetch(href, {
            cache: "no-store",
            headers: {
                "x-api-key": apiKey,
                "User-Agent": "CumulusDashboard/3.0.0"
            }
        })

        // Forward status and headers
        res.status(status);
        headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        // Pipe the response body to the Express response
        if (body) {
            body.pipe(res);
        } else {
            res.end(); // In case there's no body
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Proxy error");
    }
}

export async function proxyMiddleware(req: Request, res: Response)
{
    const { baseUrl } = config.aggregator
    try {
        const { response, body } = await request(req.url, {
            // cache: "reload"//mapCacheControlToFetchOption(req)
        })
        // console.log(response.headers)
        if (typeof body === "string") {
            res.writeHead(response.status, { 'Content-Type': 'text/plain', "X-Upstream": baseUrl });
            res.end(body);
        } else {
            res.writeHead(response.status, { 'Content-Type': 'application/json', "X-Upstream": baseUrl });
            res.end(JSON.stringify(body, null, 4));
        }
    } catch (ex) {
        console.error('Error with proxy request:', ex);
        res.setHeader("X-Upstream", baseUrl)
        res.setHeader("Cache-Control", "no-cache");
        if (ex instanceof HttpError) {
            res.status(ex.statusCode)
            res.end(ex.message)
        } else {
            res.status(500)
            res.end('Internal Server Error');
        }
    }
}

export async function request(path: string, options: FetchOptions = {})
{
    const { enabled, apiKey, baseUrl } = config.aggregator

    if (!enabled || !apiKey || !baseUrl) {
        throw new ServiceUnavailable("The aggregator API is not enabled")
    }

    const { href } = new URL(baseUrl.replace(/\/$/, "") + path);

    options.headers = {
        accept: "application/json",
        ...options.headers,
        "x-api-key": apiKey,
        "User-Agent": "CumulusDashboard/3.0.0"
    }

    return doRequest(href, options)
}

async function doRequest(url: string, options: FetchOptions)
{
    const response = await fetch(url, options)

    // Consuming as text should always be successful
    const txt = await response.text()

    // If it looks like JSON - parse it
    const type = response.headers.get("content-type")
    if (type && type.match(/\bjson\b/i)) {
        return { response, body: JSON.parse(txt || "null") }
    }

    // Otherwise, return as text
    return { response, body: txt }
}
