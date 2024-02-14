import { IncomingMessage } from "http"
import { DATA_TYPES }      from "./dataTypes"


export interface ColumnMetadata
{
    dataType   ?: keyof typeof DATA_TYPES
    label      ?: string
    description?: string
}

export interface MultiColumnMetadata
{
    dataTypes   ?: (keyof typeof DATA_TYPES)[]
    names       ?: string[]
    descriptions?: string[]
}

export enum ColumnMetadataHeaders {
    labels       = "x-column-names",
    dataTypes    = "x-column-types",
    descriptions = "x-column-descriptions"
}


/**
 * Given a response object, collect the metadata from its custom headers:
 * - `x-column-names` for human-friendly labels
 * - `x-column-types` for data types
 * - `x-column-descriptions` for column descriptions
 * 
 * These header are optional, but if provided, they must be used together and
 * contain equal amounts of comma-separated values
 */
export function getMetadataFromHeaders(response: IncomingMessage): MultiColumnMetadata
{
    const names = String(response.headers[ColumnMetadataHeaders.labels] || "")
        .trim()
        .split(/\s*,\s*/)
        .map(decodeURIComponent)
        .filter(Boolean);
    
    const dataTypes = String(response.headers[ColumnMetadataHeaders.dataTypes] || "")
        .trim()
        .split(/\s*,\s*/)
        .map(decodeURIComponent)
        .filter(Boolean) as (keyof typeof DATA_TYPES)[]
    
    const descriptions = String(response.headers[ColumnMetadataHeaders.descriptions] || "")
        .trim()
        .split(/\s*,\s*/)
        .map(decodeURIComponent)
        .filter(Boolean)
    
    return { names, dataTypes, descriptions };
}

export function detectDateType(meta: { code: string }[])
{
    // if (meta.find(x => x?.code === "d" )) return "date:YYYY-MM-DD"
    // if (meta.find(x => x?.code === "wk")) return "date:YYYY-MM-DD"
    if (meta.find(x => x?.code === "mo")) return "date:YYYY-MM"
    if (meta.find(x => x?.code === "a" )) return "date:YYYY"
    return "date:YYYY-MM-DD"
}

export function keywordToType(name: string): keyof typeof DATA_TYPES | ""
{
    const s = name.replace(/_+/, " ")

    if (/\brange\b/i  .test(s)) return "string"
    if (/\bage\b/i    .test(s) && !/\b(group|range)\b/i.test(s)) return "integer"
    if (/\bcount\b/i  .test(s)) return "integer"
    if (/\bcnt\b/i    .test(s)) return "integer"
    if (/\bint\b/i    .test(s)) return "integer"
    if (/\binteger\b/i.test(s)) return "integer"
    if (/\bfloat\b/i  .test(s)) return "float"
    if (/\bbool\b/i   .test(s)) return "boolean"
    if (/\bboolean\b/i.test(s)) return "boolean"
    if (/\byear\b/i   .test(s)) return "date:YYYY"
    if (/\bmonth\b/i  .test(s)) return "date:YYYY-MM"
    if (/\bweek\b/i   .test(s)) return "date:YYYY-MM-DD"
    if (/\bday\b/i    .test(s)) return "date:YYYY-MM-DD"
    if (/\bdate\b/i   .test(s)) return "date:YYYY-MM-DD"

    return ""
}

export function humanizeColumnName(str: string)
{
    return toTitleCase(str)
        .replace(/\bicd(\s+|-)?10\b/gi, "ICD10")
        .replace(/\bcnt\b/gi, "Count")
        .replace(/\bcovid((\s+|-)?19)?\b/gi, "COVID-19")
        .replace(/\benct\b/gi, "Encounter")
        .replace(/\benc\b/gi, "Encounter")
        .replace(/\bcond\b/gi, "Condition")
        .replace(/\bcat\b/gi, "Category")
        .replace(/\bpcr\b/gi, "PCR")
        .replace(/\bnlp\b/gi, "NLP")
        .replace(/\bdx\b/gi, "Diagnosis")
        .replace(/\bed\b/gi, "ED")
}

export function toTitleCase(str: string)
{
    return str.replace(/([A-Z])/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}
