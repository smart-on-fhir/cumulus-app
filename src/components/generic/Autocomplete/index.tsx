import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { AutocompleteValue, getSuggestions }                  from "./lib"
import "./Autocomplete.scss"


/** The height of an option in px (see .autocomplete-option) */
const ROW_HEIGHT = 24

/** How many options fit in the menu (see .autocomplete-list) */
const VISIBLE_ROWS = 12

/** Options rendered above and below the visible ones, for smooth scrolling */
const OVERSCAN = 6


/**
 * A text input that suggests values as you type, but takes any text. The
 * values are loaded the first time it gets the focus, as there can be many and
 * loading them can be slow.
 *
 * All the matches can be scrolled through, but only the visible ones are
 * rendered, so that tens of thousands stay fast.
 */
export default function Autocomplete({
    value = "",
    onChange,
    loadValues,
    placeholder
}: {
    value      ?: string
    onChange    : (value: string) => void
    loadValues  : () => Promise<AutocompleteValue[]>
    placeholder?: string
})
{
    const [values     , setValues     ] = useState<AutocompleteValue[] | null>(null)
    const [error      , setError      ] = useState(false)
    const [open       , setOpen       ] = useState(false)
    const [highlighted, setHighlighted] = useState(-1)
    const [scrollTop  , setScrollTop  ] = useState(0)

    const list = useRef<HTMLDivElement>(null)

    const { items, prefixCount } = useMemo(() => getSuggestions(values || [], value), [values, value])

    // A new loader means another column: its values are not ours
    useEffect(() => { setValues(null); setError(false) }, [loadValues])

    // New matches start from the top
    useEffect(() => {
        setHighlighted(-1)
        setScrollTop(0)
        if (list.current) list.current.scrollTop = 0
    }, [items])

    function load() {
        if (values || error) return
        loadValues().then(setValues, () => setError(true))
    }

    function pick(item: AutocompleteValue) {
        onChange(item.value)
        setOpen(false)
    }

    // Moves the highlight, and scrolls it into view
    function highlight(index: number) {
        const i = Math.max(-1, Math.min(index, items.length - 1))
        setHighlighted(i)
        const el = list.current
        if (!el || i < 0) return
        const top = i * ROW_HEIGHT
        if (top < el.scrollTop) el.scrollTop = top
        else if (top + ROW_HEIGHT > el.scrollTop + el.clientHeight) el.scrollTop = top + ROW_HEIGHT - el.clientHeight
    }

    function onKeyDown(e: KeyboardEvent) {
        const moves: Record<string, number> = {
            ArrowDown: 1,
            ArrowUp  : -1,
            PageDown : VISIBLE_ROWS - 1,
            PageUp   : -(VISIBLE_ROWS - 1)
        }
        if (e.key in moves) {
            e.preventDefault()
            setOpen(true)
            highlight(Math.max(highlighted, e.key === "ArrowUp" || e.key === "PageUp" ? 0 : -1) + moves[e.key])
        }
        else if (e.key === "Enter" && open && items[highlighted]) {
            e.preventDefault()
            pick(items[highlighted])
        }
        else if (e.key === "Escape") {
            setOpen(false)
        }
    }

    const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
    const last  = Math.min(items.length, first + VISIBLE_ROWS + OVERSCAN * 2)
    const query = value.trim()

    return (
        <div className="autocomplete">
            <input
                type="text"
                value={ value }
                placeholder={ placeholder }
                onFocus={ () => { load(); setOpen(true) } }
                onBlur={ () => setOpen(false) }
                onChange={ e => { onChange(e.target.value); setOpen(true) } }
                onKeyDown={ onKeyDown }
                role="combobox"
                aria-expanded={ open }
                aria-autocomplete="list"
            />
            { open && <div className="autocomplete-menu">
                { error ? <div className="autocomplete-note">Couldn't load the values</div> :
                  !values ? <div className="autocomplete-note"><i className="fas fa-circle-notch fa-spin" /> Loading values…</div> :
                  !items.length ? <div className="autocomplete-note">No matching values</div> :
                  <>
                    <div className="autocomplete-note">
                        { !query ? `${items.length.toLocaleString()} values` : <>
                            { prefixCount.toLocaleString() } start with "{ query }"
                            { items.length > prefixCount && `, ${(items.length - prefixCount).toLocaleString()} more contain it` }
                        </> }
                    </div>
                    <div
                        className="autocomplete-list"
                        ref={ list }
                        role="listbox"
                        style={ { maxHeight: VISIBLE_ROWS * ROW_HEIGHT } }
                        onScroll={ e => setScrollTop(e.currentTarget.scrollTop) }
                        // Scrolling with the mouse must not blur the input
                        onMouseDown={ e => e.preventDefault() }
                    >
                        <div style={ { height: items.length * ROW_HEIGHT, position: "relative" } }>
                            { items.slice(first, last).map((item, n) => {
                                const i = first + n
                                return (
                                    <div
                                        key={ i }
                                        role="option"
                                        aria-selected={ i === highlighted }
                                        className={ "autocomplete-option" + (i === highlighted ? " highlighted" : "") }
                                        style={ { top: i * ROW_HEIGHT, height: ROW_HEIGHT } }
                                        title={ item.value }
                                        onMouseDown={ e => { e.preventDefault(); pick(item) } }
                                        onMouseEnter={ () => setHighlighted(i) }
                                    >
                                        <span className="autocomplete-value">{ item.value }</span>
                                        <span className="autocomplete-count">{ item.count.toLocaleString() }</span>
                                    </div>
                                )
                            }) }
                        </div>
                    </div>
                  </>
                }
            </div> }
        </div>
    )
}
