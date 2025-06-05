import express, { Request, Response, Router } from "express"
import { rw }                                 from "../lib"
import icd10Catalog                           from "../icd10_hierarchy_count.json"
import loincCatalog                           from "../loinc_tree.json"
import { proxyMiddleware }                    from "../aggregator"


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

    "/from-parquet"
];

router.get(AGGREGATOR_PATHS, rw(proxyMiddleware))

router.get("/catalog/icd10", rw(async (req: Request, res: Response) => {
    res.json(icd10Catalog)
}))

router.get("/catalog/loinc", rw(async (req: Request, res: Response) => {
    res.json(loincCatalog)
}))

export default router
