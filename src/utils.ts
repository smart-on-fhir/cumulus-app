
// downloadBase64File(contentType:any, base64Data:any, fileName:any)
// {
//     const linkSource = `data:${contentType};base64,${base64Data}`;
//     const downloadLink = document.createElement("a");
//     downloadLink.href = linkSource;
//     downloadLink.download = fileName;
//     downloadLink.click();
// }

import moment from "moment";



const deferMap = new WeakMap();
export function defer(fn: () => void, delay = 0)
{
    if (deferMap.has(fn)) {
        if (delay) {
            clearTimeout(deferMap.get(fn))
        } else {
            cancelAnimationFrame(deferMap.get(fn))
        }
    }
    deferMap.set(
        fn,
        delay ?
            setTimeout(fn, delay) :
            requestAnimationFrame(fn)
    );
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

export function toTitleCase(str: string) {
    return str.replace(/([A-Z])/g, " $1")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .replace(/\b[a-z]/g, x => x.toUpperCase())
        .trim();
}

export function ellipsis(str: string, maxLength: number) {
    let out = str.substr(0, maxLength).trim();
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

// export function getColorAt(i: number, saturation = 75, lightness = 60, variety = 1, startColor = 0, opacity = 1) {
//     return new Color(hslToHex((startColor + (137.5 * i * variety)) % 360 , saturation, lightness))
//         .setOpacity(opacity).get('rgba') + ""
// }

export function generateColors(count: number, saturation = 75, lightness = 60, variety = 1, startColor = 0) {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        colors.push(hslToHex((startColor + (137.5 * i * variety)) % 360 , saturation, lightness));
    }
    return colors;
}