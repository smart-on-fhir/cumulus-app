import express, { Router } from "express"
import { rw }              from "../lib"
import { download, proxyMiddleware } from "../aggregator"


export const router: Router = express.Router({ mergeParams: true })


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

    "/static/catalog/icd10",
    "/static/catalog/loinc"
];

router.get(AGGREGATOR_PATHS, rw(proxyMiddleware))
router.get("/from-parquet", rw(download))

export default router
