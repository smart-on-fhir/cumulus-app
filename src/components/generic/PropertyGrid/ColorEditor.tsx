import { useEffect, useRef, useState } from "react"
import { EditableProperty }            from "./types"

function parse(s: any) {
    s = String(s || "").trim()
    if (s.startsWith("#")) {
        if (s.length === 4) { // #RGB
            return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
        }
        else if (s.length === 5) { // #RGBA
            return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}${s[4]}${s[4]}`
        }
    }    
    return s
}


// The native picker sends a change for every step of a drag. Colors are sent
// live, at most once per frame. But rendering a big chart can block the page,
// and Chrome draws its picker on the page, so the picker's pointer would lag
// and jump. If a frame takes longer than SLOW_FRAME ms during a drag, this
// editor switches to sending a color only once the pointer has stopped for
// SEND_DELAY ms, or when the picker closes.
const SLOW_FRAME = 50
const SEND_DELAY = 250

export default function ColorEditor({ prop }: { prop: EditableProperty }) {

    const [draft, setDraft] = useState<string | null>(null)
    const input   = useRef<HTMLInputElement>(null)
    const editing = useRef(false)
    const slow    = useRef(false)
    const frame   = useRef(0)
    const timer   = useRef<ReturnType<typeof setTimeout>>(undefined)
    const pending = useRef<string | null>(null)
    const latest  = useRef(prop)
    latest.current = prop

    const send = () => {
        clearTimeout(timer.current)
        timer.current = undefined
        if (pending.current !== null) {
            latest.current.onChange(pending.current)
            pending.current = null
        }
    }

    const startWatching = () => {
        let last = performance.now()
        const tick = (now: number) => {
            if (now - last > SLOW_FRAME) {
                slow.current = true
            }
            last = now
            if (!slow.current) {
                send()
            }
            frame.current = requestAnimationFrame(tick)
        }
        frame.current = requestAnimationFrame(tick)
    }

    const stopWatching = () => {
        cancelAnimationFrame(frame.current)
        frame.current = 0
        send()
    }

    useEffect(() => {
        // React's onChange is the "input" event; the native "change" event
        // fires when the picker closes
        const el = input.current
        el?.addEventListener("change", stopWatching)
        return () => {
            el?.removeEventListener("change", stopWatching)
            stopWatching()
        }
    }, [])

    const value = parse(prop.value || "")

    // While the picker is open, setting the input's value moves the picker's
    // pointer back to a color the user has already dragged past. So the input
    // is uncontrolled, and takes the value from props only when not in use.
    useEffect(() => {
        if (input.current && !editing.current) {
            input.current.value = value
        }
    }, [value])

    let c = draft ?? value

    return (
        <span className="color-editor" style={{ display: "flex" }}>
            <input
                type="color"
                ref={ input }
                defaultValue={ value }
                onChange={ e => {
                    editing.current = true
                    pending.current = e.target.value
                    setDraft(e.target.value)
                    if (!frame.current) {
                        startWatching()
                    }
                    // Sends the color if the frame loop doesn't (in slow mode)
                    clearTimeout(timer.current)
                    timer.current = setTimeout(send, SEND_DELAY)
                }}
                onBlur={ e => {
                    if (pending.current === null) {
                        e.target.value = value
                    }
                    stopWatching()
                    editing.current = false
                    setDraft(null)
                }}
                className={ prop.value ? undefined : "empty" }
                disabled={!!prop.disabled}
                style={{ background: `linear-gradient(${c || "#FFF"}, ${c || "#FFF"}), repeating-linear-gradient(-45deg, #FFF, #CCC 2px, #FFF 3px, #FFF 4px)` }}
            />
            <input
                type="text"
                value={ draft ?? prop.value ?? "" }
                onChange={ e => prop.onChange(e.target.value) }
                spellCheck={false}
                disabled={!!prop.disabled}
            />
        </span>
    )
}