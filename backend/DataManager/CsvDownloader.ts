import { request as httpRequest, IncomingMessage } from "http"
import { request as httpsRequest }                 from "https"
import { pipeline }                                from "stream/promises"
import { version }                                 from "../../package.json"
import Subscription                                from "../db/models/DataRequest"
import { BadRequest }                              from "../errors"
import Text2Lines                                  from "./Text2Lines"
import Line2CSV                                    from "./Line2CSV"
import RemoteCsvToDb                               from "./RemoteCsvToDb"
import { getMetadataFromHeaders }                  from "./lib"


/**
 * Makes a request to the specified URL.
 * - Adds custom `CumulusApp/{version}` user-agent header so that CSV servers
 *   can recognize these requests
 * - Can add an API key in the future
 * - Handles error preventing the request from being sent
 * - Requires 200 OK response and considers everything else an error
 * - Sends various BadRequest errors to the client but the sensitive information
 *   remains on the server
 * - Resolves with the native response object so we can pipe streams into it
 * @TODO: Perhaps send an API Key here?
 * @TODO: Should we require HTTPS unless running on DEV?
 */
async function request(url: URL, {
    timeout = 30,
    redirects = 10
}: {
    /**
     * Connect timeout
     */
    timeout?: number
    
    /**
     * How many redirects to follow
     */
    redirects?: number
} = {}, _previousResponses: IncomingMessage[] = []): Promise<{
    response: IncomingMessage,
    previousResponses: IncomingMessage[]
}>
{
    return new Promise((resolve, reject) => {
        const requestFn = url.protocol === "https:" ? httpsRequest : httpRequest;

        const req = requestFn(url, {
            headers: {
                "user-agent": `CumulusApp/${version}`
            }
        });

        const timer = setTimeout(() => {
            req.destroy()
            const error = new DOMException(
                `Request timed out in ${timeout} seconds and was aborted`,
                "AbortError"
            )
            reject(error)
        }, timeout * 1000)

        req.once("error", (error: any) => {
            clearTimeout(timer)
            if (error.code === 'EPROTO') {
                reject(new BadRequest("Invalid protocol", error))
            } else {
                reject(new BadRequest("Request failed", error))
            }
        })

        req.once("response", (response) => {
            clearTimeout(timer);

            if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0) && redirects) {

                const { location } = response.headers

                // Receiving a redirect response without location is considered
                // an error here (but we ignore that if `redirects` is `0`
                // because we are not going to try to redirect).
                if (!location) {
                    return reject(new BadRequest(
                        `Got a ${response.statusCode} redirect response but location header was not included`
                    ))
                }

                // Modified version of options for the redirect request
                const params = { timeout, redirects: redirects - 1 }

                // Make the new request
                return request(
                    new URL(location, url),
                    params,
                    [ ..._previousResponses, response ]
                ).then(resolve, reject)

            } else if (response.statusCode === 200) {
                resolve({ response, previousResponses: _previousResponses })
            } else {

                response.setEncoding('utf8');

                let data = "";
            
                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {
                    reject(new BadRequest(
                        `Unexpected response code ${response.statusCode}. Expecting 200.`,
                        { responseBody: data }
                    ))
                });
            }
        })

        req.end()
    })
}



/**
 * Given a subscription, fetches and ingests the data from its data URL.
 * 
 * - It is an error to call this on subscription which does not have dataURL
 * - `text/csv` responses are parsed using `,` as delimiter
 * - `text/tsv` responses are parsed using `\t` as delimiter
 * - Anything else is parsed as text and both `,` and `\t` are delimiters
 * - Strings can be quoted with double quotes (`"`)s
 * 
 * #### Response example:
 * ```http
 * Content-Type: text/csv
 * x-column-names: Count, Column A, Column B
 * x-column-types: integer, boolean, string
 * x-column-descriptions: Description for Count, Description for Column A, Description for Column B
 * 
 * CSV CONTENT...
 * ```
 */
export async function fetchSubscriptionData(subscription: Subscription)
{
    const dataURL = subscription.getDataValue("dataURL")

    if (!dataURL) {
        throw new BadRequest("Cannot fetch data for subscription having no dataURL")
    }

    const url = new URL(dataURL)

    const { response, previousResponses } = await request(url)

    response.setEncoding("utf8")

    const type = response.headers["content-type"] || ""
    
    let separators = [",", "\t"]
    if ((/\btext\/csv\b/i).test(type)) {
        separators = [","]
    }
    else if ((/\btext\/tsv\b/i).test(type)) {
        separators = ["\t"]
    }
    
    const headers = [response, ...previousResponses].map(r => r.headers)

    const meta = getMetadataFromHeaders(headers)

    const transaction = await subscription.sequelize.transaction()

    try {
        await pipeline(
            response,
            new Text2Lines(),
            new Line2CSV(separators, '"'),
            new RemoteCsvToDb(subscription, transaction, meta)
        )
        await transaction.commit()
    } catch (ex) {
        // console.error(ex)
        await transaction.rollback()
        throw new BadRequest((ex as Error).message, { reason: ex })
    }
}
