import express, { Router }           from "express"
import { rw }                        from "../lib"
import { download, proxyMiddleware } from "../aggregator"
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
router.get("/data-packages/:id", rw(proxyMiddleware((pkg: DataPackage) => fixDataPackage(pkg))))

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

            // Try to detect the column dataType
            col.dataType = detectColumnDataType(name, col.type);

            // Try in this order: aggregator label, generated humanized name
            col.label = col.label || humanizeColumnName(name);

            // Try in this order: aggregator description, library description, library display, use the label as description
            col.description = col.description || meta.description || meta.display || col.label;

            return [name, col];
        }))
    };
}

function detectColumnDataType(name: string, type: string): string {

    const keywords: [RegExp, string][] = [
        [/(?:\b|_)(group|range)(?:\b|_)/i                , 'string' ],
        [/(?:\b|_)year(?:\b|_)/i                         , 'date:YYYY'],
        [/(?:\b|_)month(?:\b|_)/i                        , 'date:YYYY-MM'],
        [/(?:\b|_)(week|day|date)(?:\b|_)/i              , 'date:YYYY-MM-DD'],
        [/(?:\b|_)(age|days|years|months|weeks)(?:\b|_)/i, 'integer'],
        [/(?:\b|_)(daily|yearly|monthly|weekly)(?:\b|_)/i, 'integer'],
        [/(?:\b|_)(period|ordinal|count|cnt)(?:\b|_)/i   , 'integer'],
        [/(?:\b|_)(int|integer)(?:\b|_)/i                , 'integer'],
        [/(?:\b|_)float(?:\b|_)/i                        , 'float'  ],
        [/(?:\b|_)(bool|boolean)(?:\b|_)/i               , 'boolean'],
        [/^(is|has|not|was)(?:\b|_)/i                    , 'boolean'],
    ];

    for (const [re, dataType] of keywords) {
        if (name.match(re)) {
            return dataType
        }
    }

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

    // return original type if no special match is detected
    return type;
}
