import { app } from "./types"


export function downloadBase64File(contentType:any, base64Data:any, fileName:any)
{
    const linkSource = `data:${contentType};base64,${base64Data}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
}

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
    [/\bed\b/gi                , "ED"       ],
    [/\bpt\b/gi                , "Patient"  ],
    [/\bpat\b/gi               , "Patient"  ],
    [/\bstd\s+dev\b/gi         , "Standard Deviation"]
]);

export function humanizeColumnName(str: string) {
    let out = str
    dictionaryMap.forEach((replacement, re) => {
        out = out.replace(re, replacement)
    })
    return toTitleCase(out).replaceAll("COVID 19", "COVID-19")
}

export function toTitleCase(str: string) {
    return str.replace(/([A-Z]+)/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}

export function pluralize(str: string) {

    // Skip empty or space-only strings
    if (!str.trim()) {
        return str
    }

    // Leave abbreviations non-pluralized
    if (str.match(/^[A-Z0-9\W]+$/)) {
        return str
    }

    // For weird cases like "Diagnosis" -> "Diagnoses"
    if (str.match(/sis$/i)) {
        return str.replace(/sis$/i, "ses")
    }

    // Already plural
    if (str.match(/[BCDFGHJKLMNPQRSTVWXYZ]s$/i)) {
        return str
    }

    // for words ending in "s", "x", "z", "ch", or "sh", add "es"
    if (str.match(/(s|x|z|ch|sh)$/i)) {
        return str + "es"
    }

    // if a word ends in "y" preceded by a consonant "y" to "ies"
    if (str.match(/[BCDFGHJKLMNPQRSTVWXYZ]y$/i)) {
        return str.substring(0, str.length - 1) + "ies"
    }

    // Standard - just add "s"
    return str + "s"
}

// export function ellipsis(str: string, maxLength: number) {
//     let out = str.substring(0, maxLength).trim();
//     if (out.length < str.length) {
//         return out + "..."
//     }
//     return out
// }
export function ellipsis(txt: string, maxLength: number, position: "start"|"end"|"middle" = "end") {
    const l = txt.length;
    if (l <= maxLength) {
        return txt
    }
    if (position === "end") {
        return txt.substring(0, maxLength) + "…"
    }
    if (position === "start") {
        return "…" + txt.substring(l - maxLength)
    }
    const left  = txt.substring(0, Math.ceil(maxLength / 2))
    const right = txt.substring(l - Math.floor(maxLength / 2))
    return left + "\u200B…\u200B" + right
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

export function stripValue<T=Record<string, any> | any[]>(o: T, needle: any): T {
    if (Array.isArray(o)) {
        let out = []
        for (let i = 0; i < o.length; i++) {
            let value = o[i];
            if (value !== needle) {
                out.push(
                    value && typeof value === "object" ?
                        stripValue(value, needle) :
                        value
                )
            }
        }
        return out as unknown as T
    } else {
        let out = {} as any
        for (let key in o) {
            let value = o[key];
            if (value !== needle) {
                out[key] = value && typeof value === "object" ?
                    stripValue(value, needle) :
                    value
            }
        }
        return out as unknown as T
    }
}

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
                    // @ts-ignore
                    out.push(strip(value, paths, [..._path, "[]"]))
                } else {
                    // @ts-ignore
                    out.push(value)
                }
            }
        })
    } else {
        forEach(a, (value, key) => {
            if (!paths.includes([..._path, key].join("."))) {
                if (value && typeof value === "object") {
                    // @ts-ignore
                    out[key] = strip(value, paths, [..._path, key])
                } else {
                    // @ts-ignore
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

export function highlight(str: string, stringToFind = "", useHtml = false) {
    if (!stringToFind) {
        return str
    }

    const fragments = []
    const q = stringToFind.toLowerCase()

    let i = 0;
    let temp = str;
    let index = temp.toLowerCase().indexOf(q);
    while (index > -1) {
        fragments.push(temp.substring(0, index))
        const endIndex = index + q.length;
        fragments.push(useHtml ?
            `<span class="search-match">${ temp.substring(index, endIndex) }</span>` :
            <span className="search-match" key={i++}>{ temp.substring(index, endIndex) }</span>
        )
        temp  = temp.substring(endIndex);
        index = temp.toLowerCase().indexOf(q);
    }

    if (temp) {
        fragments.push(temp)
    }

    return fragments;
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

export function buildPermissionLabel({
    user_group_id,
    role,
    user_id,
    permission,
    action,
    resource_id,
    resource,
    attribute
}: {
    user_group_id?: app.Permission["user_group_id"]
    role         ?: app.Permission["role"]
    user_id      ?: app.Permission["user_id"]
    permission    : app.Permission["permission"]
    action        : app.Permission["action"]
    attribute     : app.Permission["attribute"]
    resource_id   : app.Permission["resource_id"]
    resource      : app.Permission["resource"]
}) {
    let label = "";

    if (user_group_id) {
        label += `Members of user group #${ user_group_id } are`
    } else if (role) {
        label += `Users with role "${ role }" are`
    } else if (user_id) {
        label += `User#${ user_id } is`
    }

    label += `${permission ? "" : " not"} allowed to ${action}`
    label += attribute ? ` the "${attribute}" attribute of` : ""
    label += resource_id ? ` ${resource}#${ resource_id }` : ` all ${resource}`
    return label;
}

export function buildPermissionId({
    resource,
    resource_id,
    attribute,
    action
}: {
    resource     : string
    action       : string
    resource_id ?: number | null
    attribute   ?: string | null
    [key: string]: any
}) {
    let key = resource
    if (resource_id) {
        key += "#" + resource_id
    }
    if (attribute) {
        key += "." + attribute
    }
    key += "." + action
    return key
}

export function requestPermission({ user, resource, resource_id, action }: {
    user       ?: app.CurrentUser | null
    resource    : string
    action      : string
    resource_id?: number
}, onReject?: ((message: string) => void))
{
    const { role = "guest", id = -1, permissions = [] } = user || {}

    if (role === "system" || role === "owner") {
        return true
    }

    const tried: string[] = [];
    
    // Resource#id.action ------------------------------------------------------
    if (resource_id) {
        const perm = buildPermissionId({ resource, action, resource_id })
        if (permissions.includes(perm)) {
            return true
        }
        tried.push(perm)
    }
    
    // Resource.action ---------------------------------------------------------
    const perm = buildPermissionId({ resource, action });
    if (permissions.includes(perm)) {
        return true
    }
    tried.push(perm)
    
    
    // No permissions found ----------------------------------------------------
    if (onReject) {
        let msg = role === "guest" ?
            "Guest" :
            `User${id > 0 ? `#${id}` : ""}(role="${role}")`;
        msg += ` needs at least one of the following permissions: "${tried.join('", "')}".`
        console.info(msg)
        onReject(msg);
    }

    return false
}

export function cachedPromise<T>(fn: () => Promise<T>) {
    let cache: any;
    return function() {
        if (!cache) {
            cache = fn() as Promise<T>
        }
        return cache as Promise<T>
    }
}

export function assert(condition: any, error?: string | ErrorConstructor, ctor: any = Error): asserts condition {
    if (!(condition)) {
        if (typeof error === "function") {
            throw new error()
        }
        else {
            throw new ctor(error || "Assertion failed")
        }
    }
}

export function sortBy<T = any>(arr: T[], prop: string): T[] {
    return arr.sort((a: any, b: any) => String(a[prop])
        .localeCompare(b[prop], "en-US", { numeric: true, sensitivity: "base" }))
}

export function groupBy(data: Record<string, any>[], prop: string): Record<string, typeof data> {
    const groups: Record<string, typeof data> = {}

    for (const item of data) {
        let group = groups[item[prop]]
        if (!group) {
            group = groups[item[prop]] = []
        }
        group.push(item)
    }

    return groups;
}

export function centerElement(element: HTMLElement) {
    if (element) {
        element.style.transform = `translate(${
            window.innerWidth / 2 - element.offsetWidth / 2
        }px, ${
            window.innerHeight / 2 - element.offsetHeight / 2
        }px)`
    }
}
