import express, { Router }           from "express"
import { rw }                        from "../lib"
import { download, proxyMiddleware } from "../aggregator"
import { verifyColumnTypes }         from "../aggregatorColumnTypes"
import { humanizeColumnName }        from "../DataManager/lib";
import * as library                  from "../cumulus_library_columns.json"


export const router: Router = express.Router({ mergeParams: true })


// These are the only paths we recognize and proxy to the aggregator
const AGGREGATOR_PATHS = [
    
    // metadata
    "/metadata/:site/:study/:subscription",
    "/metadata/:site/:study",
    "/metadata/:site",
    "/metadata",

    // chart-data
    // "/chart-data/:subscription_name",

    // study-periods
    "/study-periods/:site/:study",
    "/study-periods/:site",
    "/study-periods",

    "/static/catalog/icd10",
    "/static/catalog/loinc"
];

router.get(AGGREGATOR_PATHS, rw(proxyMiddleware()))

router.get("/from-parquet", rw(download))

router.get("/data-packages"    , rw(proxyMiddleware((packages: DataPackage[]) => packages.map(fixDataPackage))))
// TEMPORARY: verifyColumnTypes corrects aggregator types the data disproves
// (see aggregatorColumnTypes.ts). It reads the package's data, so it runs here
// and not for the whole list.
router.get("/data-packages/:id", rw(proxyMiddleware((pkg: DataPackage) => verifyColumnTypes(fixDataPackage(pkg)))))

export default router

export interface DataPackage {
    column_types_format_version: string // example: "1"
    columns                    : Record<string, DataPackageColumn>
    id                         : string // example: "core__count_condition_icd10_month"
    last_data_update           : string // example: "2024-09-30T18:13:49.211590+00:00"
    name                       : string // example: "count_condition_icd10_month"
    study                      : string // example: "core"
    total                      : number // example: 1359
    version                    : string // example: "000"
    type                      ?: "cube" | "flat"
    s3_path                   ?: string
    site                      ?: string
}

export interface DataPackageColumn {
    name: string
    dataType: string
    type: string
    label: string
    description: string
    distinct_values_count?: number
}

function fixDataPackage(pkg: DataPackage) {
    return {
        ...pkg,
        columns: Object.fromEntries(Object.entries(pkg.columns).map(([name, col]) => {
            
            // We use cumulus_library_columns.json for additional column metadata
            const meta = library[name] || {};
            
            // Add the name to the object (instead of only using the key)
            col.name = name; 

            // The dashboard's name for the type the aggregator declares. Name-based
            // corrections are verified separately, for single packages only
            col.dataType = toDashboardDataType(col.type);

            // Try in this order: aggregator label, generated humanized name
            col.label = col.label || humanizeColumnName(name);

            // Try in this order: aggregator description, library description, library display, use the label as description
            col.description = col.description || meta.description || meta.display || col.label;

            return [name, col];
        }))
    };
}

export function toDashboardDataType(type: string): string {

    // Convert aggregator types to dashboard types
    if (type === "year") {
        return "date:YYYY"
    }

    if (type === "month") {
        return "date:YYYY-MM"
    }

    if (type === "week" || type === "day" || type === "date") {
        return "date:YYYY-MM-DD"
    }

    return type;
}
