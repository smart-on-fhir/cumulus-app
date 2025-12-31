import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { classList, groupBy } from "../../../utils"
import "./Select.scss"


export interface TypeAheadProps {
    value      ?: string
    onChange    : (value: string) => void
    tabIndex   ?: number
    options    ?: TypeAheadOption[]
    placeholder?: string
    title      ?: string
}

export interface TypeAheadOption {
    value    : any
    label    : string
    disabled?: boolean
    group?   : string
}

export default function TypeAhead({
    tabIndex    = 0,
    options     = [],
    placeholder = "",
    value,
    onChange,
    title
}: TypeAheadProps)
{
    const selectedIndex  = options.findIndex(opt => opt.value === value)
    const selectedOption = useMemo(() => options[selectedIndex] || { label: "", value: "" }, [options, selectedIndex])
    
    const [ highlightedIndex, setHighlightedIndex ] = useState(selectedIndex)
    const [ menuOpen        , setMenuOpen         ] = useState(false)
    const [ search          , setSearch           ] = useState(selectedOption.label)
    const [ searchValue     , setSearchValue      ] = useState(selectedOption.label)

    // Only show options containing what we searched for
    let filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        // .sort((a, b) => a.label.length - b.label.length)
        .sort((a, b) => a.label.localeCompare(b.label))

    const groups = groupBy(filteredOptions, "group")

    const menu  = useRef<HTMLDivElement>(null!)
    const input = useRef<HTMLInputElement>(null!)

    useEffect(() => {
        const currentMenu = menu.current
        if (currentMenu && currentMenu.scrollHeight > currentMenu.offsetHeight) {
            currentMenu.querySelector(".select-component-option.selected")?.scrollIntoView({ block: "nearest" })
        }
    })

    useEffect(() => {
        setSearchValue(selectedOption.label)
    }, [selectedOption])

    useEffect(() => {
        const currentInput = input.current
        if (currentInput) {
            currentInput.setSelectionRange(search.length, currentInput.value.length)
        }
    })
    
    function onKeyDown(e: KeyboardEvent) 
    {
        switch (e.key) {
            case "ArrowDown":
                if (!menuOpen) {
                    e.preventDefault()
                    openMenu()
                } else {
                    const nextIndex  = highlightedIndex + 1
                    const nextOption = filteredOptions[nextIndex]
                    if (nextOption) {
                        e.preventDefault()
                        setHighlightedIndex(nextIndex);
                        setSearchValue(nextOption.label)
                    }
                }
                break;
            case "ArrowUp":
                if (highlightedIndex > 0) {
                    e.preventDefault()
                    if (menuOpen) {
                        const nextIndex  = highlightedIndex - 1
                        const nextOption = filteredOptions[nextIndex]
                        if (nextOption) {
                            e.preventDefault()
                            setHighlightedIndex(nextIndex);
                            setSearchValue(nextOption.label)
                        }
                    } else {
                        openMenu()
                    }
                } else {
                    closeMenu()
                }
                break;
            case "Escape":
                e.preventDefault();
                setSearchValue(selectedOption.label)
                closeMenu()
                break;
            case "Enter":
                e.preventDefault()
                const nextOption = filteredOptions[highlightedIndex]
                setSearchValue(nextOption.label)
                onChange(nextOption.value)
                closeMenu()
                break;
            default:
                break;
        }
    }

    function closeMenu() {
        setMenuOpen(false)
        setHighlightedIndex(-1)
    }

    function openMenu() {
        setMenuOpen(true)
    }

    function toggleMenu() {
        if (menuOpen) {
            closeMenu()
        } else {
            openMenu()
        }
    }
    
    return (
        <div className="type-ahead-component">
            <input
                type="text"
                aria-invalid={ filteredOptions.length === 0 }
                className="form-control type-ahead-component-value"
                placeholder={placeholder}
                tabIndex={ tabIndex }
                value={ searchValue }
                onKeyDown={ onKeyDown }
                onBlur={ closeMenu }
                onMouseDown={ toggleMenu }
                title={ title }
                ref={input}
                onChange={e => {
                    setSearch(e.target.value)
                    setSearchValue(e.target.value)
                    setHighlightedIndex(e.target.value ? 0 : -1)
                    openMenu()
                }}
            />
            { filteredOptions.length > 0 && <div className={
                classList({
                    "select-component-menu": true,
                    open: menuOpen,
                })
            }>
                <div className="select-component-menu-wrap" ref={menu}>
                    { Object.keys(groups).map((groupKey, gi) => {
                        const group = groups[groupKey];
                        return (
                            <div key={gi} className="select-component-group">
                                { groupKey && <div className="select-component-group-label"><i className="fa fa-folder-open"/>{ groupKey }</div> }
                                { group.map((option, i) => {
                                    const index = filteredOptions.findIndex(o => o.value === option.value)
                                    return (
                                        <div key={i} className={ classList({
                                                "select-component-option": true,
                                                disabled: !!option.disabled,
                                                selected: highlightedIndex === index
                                            })}
                                            onMouseDown={() => {
                                                if (!option.disabled) {
                                                    setSearchValue(option.label)
                                                    onChange(option.value)
                                                    closeMenu()
                                                }
                                            }}>
                                            <span>{ option.label }</span>
                                        </div>
                                    )
                                }) }
                            </div>
                        )
                    }) }
                </div>
            </div> }
        </div>
    )
}
