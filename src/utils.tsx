import moment from "moment";
import { app } from "./types"


// downloadBase64File(contentType:any, base64Data:any, fileName:any)
// {
//     const linkSource = `data:${contentType};base64,${base64Data}`;
//     const downloadLink = document.createElement("a");
//     downloadLink.href = linkSource;
//     downloadLink.download = fileName;
//     downloadLink.click();
// }

const deferMap = new WeakMap();

export function defer(fn: () => void, delay?: number)
{
    const f = () => {
        fn()
        deferMap.delete(fn)
    };

    const ref = deferMap.get(fn);
    if (ref) {
        if (delay === undefined) {
            cancelAnimationFrame(ref)
        } else {
            clearTimeout(ref)
        }
    }

    deferMap.set(fn, delay === undefined ? requestAnimationFrame(f) : setTimeout(f, delay));
}

export function classList(map: Record<string, boolean>): string | undefined {
    let cls: string[] = [];
    for (let name in map) {
        if (name && name !== "undefined" && map[name]) {
            cls.push(name)
        }
    }
    return cls.join(" ") || undefined
}

interface FormatOptions {
    skipNull?: boolean
    skipUndefined?: boolean
    maxListLength?: number
    maxLength?: number
    html?: boolean
}

export function format(
    value: any|any[],
    dataType: app.supportedDataType,
    options: FormatOptions = {}
): string {
    if (Array.isArray(value)) {
        return formatArray(value, dataType, options)
    }

    const { html, skipNull, skipUndefined, maxLength = 0 } = options

    if (value === null) {
        return skipNull ? "" : html ? '<span class="null">null</span>' : "null"
    }

    if (value === undefined) {
        return skipUndefined ? "" : html ? '<span class="undefined">undefined</span>' : "undefined"
    }

    let formatted = "";

    switch (dataType) {
        case "boolean":
            formatted = String(value === true)
            break;
        case "integer":
            formatted = String(parseInt(value + "", 10))
            break;
        case "float":
            formatted = String(parseFloat(value + ""))
            break;
        case "date:YYYY":
            formatted = moment(value).format("YYYY")
            break;
        case "date:YYYY-MM":
            formatted = moment(value).format("YYYY-MM")
            break;
        case "date:YYYY-MM-DD":
            formatted = moment(value).format("YYYY-MM-DD")
            break;
        case "string":
            formatted = value + ""
            break;
        default:
            throw new Error(`Unsupported format for data type "${dataType}"`)
    }

    if (maxLength > 0 && maxLength < formatted.length) {
        formatted = formatted.substr(0, maxLength) + "…"
    }

    if (html) {
        formatted = `<span class="${dataType}">${formatted}</span>`
    }

    return formatted
}

export function formatArray(
    value: any[],
    dataType: app.supportedDataType,
    options: FormatOptions = {}
): string
{
    const {
        maxListLength = 0,
        maxLength = 0,
        skipNull,
        skipUndefined
    } = options;

    let overflowed = false
    
    let list: string[] = [], len = 0, strLen = 0

    for (const cur of value) {

        if (skipNull && cur === null) {
            continue
        }
    
        if (skipUndefined && cur === undefined) {
            continue
        }

        // Overflow by number of list items
        if (maxListLength > 0 && len >= maxListLength) {
            overflowed = true;
            break
        }

        const formatted = format(cur, dataType, options)

        // Overflow by total string length
        if (maxLength > 0) {
            strLen += formatted.replace(/<.*?>/g, "").length
            if (strLen >= maxLength) {
                overflowed = true;
                break
            }
        }

        len = list.push(formatted)
    }

    return list.join(", ") + (overflowed ?
        ", … " + (value.length - list.length) + " more" :
        ""
    )
}

const dictionaryMap = new Map([
    [/\bicd(\s+|-)?10\b/gi     , "ICD10"    ],
    [/\bcnt\b/gi               , "Count"    ],
    [/\bcovid((\s+|-)?19)?\b/gi, "COVID-19" ],
    [/\benct\b/gi              , "Encounter"],
    [/\benc\b/gi               , "Encounter"],
    [/\bcond\b/gi              , "Condition"],
    [/\bcat\b/gi               , "Category" ],
    [/\bpcr\b/gi               , "PCR"      ],
    [/\bnlp\b/gi               , "NLP"      ],
    [/\bdx\b/gi                , "Diagnosis"],
    [/\bed\b/gi                , "ED"       ]
]);

export function humanizeColumnName(str: string) {
    let out = toTitleCase(str)
    dictionaryMap.forEach((replacement, re) => {
        out = out.replace(re, replacement)
    })
    return out
}

export function toTitleCase(str: string) {
    return str.replace(/([A-Z])/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}

export function ellipsis(str: string, maxLength: number) {
    let out = str.substring(0, maxLength).trim();
    if (out.length < str.length) {
        return out + "..."
    }
    return out
}

export function hslToHex(h: number, s: number, l: number) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * @param count How many colors to generate?
 * @param saturation 0 to 100; defaults to 75.
 * @param lightness 0 to 100; defaults to 60.
 * @param variety 0 to 2; defaults to 1
 * @param startColor Start hue angle. Defaults to 0.
 */
export function generateColors(count: number, saturation = 75, lightness = 50, variety = 1, startColor = 0): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        colors.push(hslToHex(
            (startColor + (137.5 * i * variety)) % 360,
            saturation,
            lightness
        ));
    }
    return colors;
}

// export function stripValue<T=Record<string, any> | any[]>(o: T, needle: any): number {
//     let strips = 0

//     if (Array.isArray(o)) {
//         for (let i = 0; i < o.length; i++) {
//             let value = o[i];
//             if (value === needle) {
//                 o.splice(i, 1)
//                 strips += 1
//                 i -= 1
//             }
//             else if (value && typeof value === "object") {
//                 strips += stripValue(o[i], needle)
//             }
//         }
//     } else {
//         for (let key in o) {
//             let value = o[key];
//             if (value === needle) {
//                 delete o[key]
//                 strips += 1
//             }
//             else if (value && typeof value === "object") {
//                 strips += stripValue(o[key], needle)
//             }
//         }
//     }

//     return strips
// }

// export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
//     forEach(source, (src, key) => {
//         const dst         = target[key]
//         const srcIsObject = src && typeof src === "object"
//         const dstIsObject = dst && typeof dst === "object"
//         const srcIsArray  = Array.isArray(src)
//         const dstIsArray  = Array.isArray(dst)

//         if (srcIsArray) {
//             target[key] = deepMerge([], src);
//         } else if (srcIsObject) {
//             target[key] = deepMerge(dstIsArray ? {} : dstIsObject ? dst : {}, src);
//         } else {
//             target[key] = src;
//         }
//     })
//     return target;
// }

export function isEmptyObject(x: Record<string, any>): boolean {
    for (let _ in x) {
        return false
    }
    return true
}

export function forEach<T=Record<string, any>|any[]>(o: T, cb: (item: any, key: string | number, all: T) => void) {
    if (Array.isArray(o)) {
        for ( let i = 0; i < o.length; i++ ) {
            cb(o[i], i, o);
        }
    } else {
        for(let key in o) {
            cb(o[key], key, o)
        }
    }
}

export function objectDiff<T=Record<string, any>|any[]>(a: T, b: T): T {
    
    const isArray = Array.isArray(a);

    let out = isArray ? [] as any[] : {} as Record<string, any>;

    forEach(a, (value, key) => {
        const valueA = value;
        // @ts-ignore
        const valueB = b[key];
        const typeA  = Object.prototype.toString.call(valueA);
        const typeB  = Object.prototype.toString.call(valueB);

        if (typeA !== typeB) {
            out[key] = valueA
        } else if (typeA === "[object Object]" || typeA === "[object Array]") {
            const child = objectDiff(valueA, valueB)
            if (!isEmptyObject(child)) {
                out[key] = child
            }
        } else if (valueA !== valueB) {
            out[key] = valueA
        }
    })

    return out as T;
}

export function strip(
    a: Record<string, any> | any[],
    paths: string[],
    _path: (string|number)[] = []
): Record<string, any> | any[] {
    
    const isArray = Array.isArray(a);

    let out = isArray ? [] as any[] : {} as Record<string, any>;

    if (Array.isArray(a)) {
        forEach(a, (value, key) => {
            if (!paths.includes([..._path, "[]", key].join("."))) {
                if (value && typeof value === "object") {
                    out[key] = strip(value, paths, [..._path, "[]"])
                } else {
                    out[key] = value
                }
            }
        })
    } else {
        forEach(a, (value, key) => {
            if (!paths.includes([..._path, key].join("."))) {
                if (value && typeof value === "object") {
                    out[key] = strip(value, paths, [..._path, key])
                } else {
                    out[key] = value
                }
            }
        })
    }

    return out;
}

export function stripTags(s: string) {
    return s.replace(/<.*?>/g, "")
}

export function highlight(str: string, stringToFind = "") {
    if (!stringToFind) {
        return str
    }
    let temp  = str;
    let index = str.toLocaleLowerCase().indexOf(stringToFind.toLocaleLowerCase());
    while (index > -1) {
        const replacement = `<span class="search-match">${temp.substr(index, stringToFind.length)}</span>`;
        const endIndex = index + stringToFind.length;
        temp  = temp.substring(0, index) + replacement + temp.substring(endIndex);
        index = temp.toLocaleLowerCase().indexOf(stringToFind.toLocaleLowerCase(), index + replacement.length);
    }
    return temp;
}

export function Json(data: any, indent = 0): any {
    if (data === null) return <span className="json-null">null</span>
    if (typeof data === "boolean") return <span className="json-bool">{data ? "true" : "false"}</span>
    if (typeof data === "number") return <span className="json-number">{data}</span>
    if (typeof data === "string") return <span className="json-string">{JSON.stringify(data)}</span>
    if (typeof data === "object") {
        if (Array.isArray(data)) {
            if (data.length < 4) {
                return <><b>[</b>{ data.map((x, i) => (<span key={i}>
                    { i > 0 ? ", " : "" }
                    { Json(x, indent) }
                </span>)) }<b>]</b></>
            }
            return <><b>[</b>{ data.map((x, i) => (
                <span key={i}>
                    { i > 0 && "," }
                    <br />
                    {"    ".repeat(indent + 1)}
                    { Json(x, indent + 1) }
                </span>
            )) }<br />{"    ".repeat(indent)}<b>]</b></>
        } else {
            return <><b>{"{"} </b>{ Object.keys(data).map((k, i) => (
                <span key={i}>
                    { i > 0 && "," }
                    <br />
                    {"    ".repeat(indent + 1)}
                    <span className="json-key">{k}</span>: { Json(data[k], indent + 1) }
                </span>
            )) }<br />{"    ".repeat(indent)}<b>{"}"}</b></>
        }
    }
    return JSON.stringify(data)
}

/**
 * Rounds the given number @n using the specified precision.
 */
export function roundToPrecision(n: string | number, precision?: number) {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        n = Math.round( n );
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round( n * q ) / q;
    }

    return n;
}

export function escapeForFileName(input: string): string {
    return input.trim()
        .replace(/[/:*?"<>|\\]+/g, "_")
        .replace(/\s+/g, " ")
        .replace(/_+/g, "_")
        .replace(/(_|\s|\.)$/, "");
}
 
export function lengthToEm(length?: string, base = 16) {
    length = String(length || "")
    const num = parseFloat(length)
    if (isNaN(num) || !isFinite(num)) {
        return 1
    }
    if (length.endsWith("px")) {
        return roundToPrecision(num / base, 2)
    }
    if (length.endsWith("rem")) {
        return num // convert to em
    }
    if (length.endsWith("em")) {
        return num
    }
    if (length.endsWith("%")) {
        return roundToPrecision(num / 100, 2)
    }
    return 1
}