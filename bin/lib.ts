import readline from "readline/promises"
import clc      from "cli-color"


const rl = readline.createInterface({ input: process.stdin, output: process.stdout });


export function list(items: (string | number | boolean)[], conditional = "or") {
    if (items.length === 1) {
        return clc.bold.cyan(JSON.stringify(items[0]))
    }
    items = [ ...items ]
    const last = items.pop()
    return items.map(s => clc.bold.cyan(JSON.stringify(s))).join(", ") +
        " " + conditional + " " + clc.bold.cyan(JSON.stringify(last))
}

export async function ask(
    question: string,
    {
        answers,
        defaultValue,
        required,
        currentValue
    }: {
        answers?: string[]
        defaultValue?: any
        required?: boolean
        currentValue?: string|number|boolean
    } = {}
) {
    
    let msg = ["\n" + clc.green(question.trim())];

    if (answers) {
        msg.push(`\n• Supported values: ${list(answers)}.`)
    }

    if (defaultValue !== undefined) {
        msg.push(`\n• Default value: ${clc.bold.magenta(JSON.stringify(defaultValue))}.`)
    } else {
        msg.push(`\n• This variable has no default value.`)
    }
    if (currentValue !== undefined) {
        msg.push(`\n• Your current value is ${clc.bold.magenta(JSON.stringify(currentValue))}.`)
    }
    if (defaultValue !== undefined) {
        msg.push(`\n• Hit Enter to accept the default value.`)
    }
    let answer = (await rl.question(
        msg.join(question.includes("\n") ? "\n" : " ") + "\n" + clc.bold("Answer: ")
    )).trim()

    if (!answer) answer = defaultValue

    while (!answer && required) {
        process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
        answer = await rl.question(clc.italic.green(
            `⛔️ This value is required! Please try again:\n`
        ));
    }

    if (answers) {
        while (!answers.includes(answer)) {
            process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
            answer = await rl.question(clc.italic.green(
                `⛔️ Only the following values are supported: ${list(answers)}. ` +
                'Please try again:\n'
            ));
        }
    }

    process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
    console.log(clc.bold.yellow(answer))

    return answer
}

/**
 * Renders a progress bar in the terminal
 * @param pct Percentage now
 * @param message Any message to render below the progress bar
 * @param width Char width of the entire progress bar
 */
export function progress(pct: number, message = "", width = 100) {
    pct = Math.round(pct)
    const done = Math.floor( width / 100 * pct)
    let out = ""
    for (let i = 0; i < width; i++) {
        out += i <= done ? clc.black("█") : clc.white("█")
    }
    out += " " + pct + "%\n" + message
    process.stdout.clearScreenDown()
    process.stdout.write(out);
    process.stdout.moveCursor(0, -1);
    process.stdout.write('\r');
}

/**
 * @param ms How many milliseconds to sleep 
 */
export async function sleep(ms = 0) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

export function getPath(obj: object, path: string) {
    const segments = path.split(".")
    return segments.reduce((prev, cur, i) => {
        if ((cur === "[]" || cur === "") && Array.isArray(prev)) {
            return prev.map(x => getPath(x, segments.slice(i + 1).join(".")))
        }
        return prev?.[cur]
    }, obj)
}

export function hasPath(obj: object, path: string): boolean {
    const result = getPath(obj, path)
    if (path.includes("[]") || path.includes("..")) {
        return result !== undefined && !isArrayOfUndefined(result)
    }
    return result !== undefined
}

export function deletePath(obj: object, path: string) {
    const segments = path.split(".")
    const length   = segments.length

    let i = 0, prev = obj
    for (const key of segments) {
        if (i === length - 1) {
            delete prev[key]
        }
        else {
            // a..b or a.[].b => forEach
            if ((key === "[]" || key === "") && Array.isArray(prev)) {
                return prev.forEach(entry => deletePath(entry, segments.slice(i + 1).join(".")))
            }
            else {
                prev = prev?.[key]
                i++
            }
        }
    }

    return obj
}

export function isArrayOfUndefined(x: any): boolean {
    return Array.isArray(x) && x.length > 0 && x.every(entry => entry === undefined)
}
