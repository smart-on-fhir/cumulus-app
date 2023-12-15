import { KeyboardEvent, useState } from "react";
import { classList } from "../../../utils"
import "./Select.scss"


function Icon({ arg }: { arg: string }) {
    if ((/^(\.|\/).+/).test(arg)) {
        return <img alt="icon" src={arg} className="select-component-option-icon" />
    }
    return <i className={ arg + " select-component-option-icon" }/>
}

export interface SelectProps {
    tabIndex?: number
    options?: SelectOption[]
    placeholder?: string
    value?: any
    right?: boolean
    onChange: (value: any) => void
    title?: string
}

export interface SelectOption {
    value: any
    label: string | JSX.Element
    icon?: string
    disabled?: boolean
    right?: string | JSX.Element
}

export default function Select({
    tabIndex    = 0,
    options     = [],
    placeholder = "",
    value,
    onChange,
    right,
    title
}: SelectProps)
{
    const selectedIndex  = options.findIndex(opt => opt.value === value)
    const selectedOption = options[selectedIndex]
    
    const [ highlightedIndex, setHighlightedIndex ] = useState(selectedIndex)
    const [ menuOpen, setMenuOpen ] = useState(false)

    // const minWidth = (options.sort(
    //     (a, b) => b.label.length - a.label.length
    // )[0]?.label?.length || 10) * 0.6 + "em";

    function onKeyDown(e: KeyboardEvent) 
    {
        switch (e.key) {
            case "ArrowDown":
                if (!menuOpen) {
                    e.preventDefault()
                    openMenu()
                } else if (highlightedIndex < options.length - 1) {
                    e.preventDefault()
                    setHighlightedIndex(highlightedIndex + 1);
                }
                break;
            case "ArrowUp":
                if (highlightedIndex > 0) {
                    e.preventDefault()
                    if (menuOpen) {
                        setHighlightedIndex(highlightedIndex - 1);
                    } else {
                        openMenu()
                    }
                } else {
                    closeMenu()
                }
                break;
            case "Escape":
                e.preventDefault();
                closeMenu()
                break;
            case "Enter":
                e.preventDefault()
                onChange(options[highlightedIndex].value)
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
        <div
            className={ classList({ "form-control select-component": true, right: !!right }) }
            tabIndex={ tabIndex }
            onKeyDown={ onKeyDown }
            onBlur={ closeMenu }
            onMouseDown={ toggleMenu }
            title={ title }
        >
            <div className="select-component-value">{
                selectedOption ?
                    <>
                        { selectedOption.icon && <Icon arg={ selectedOption.icon }/>} <span>{ selectedOption.label }</span>{
                            selectedOption.right && <span className="right">{ selectedOption.right }</span>
                        }
                    </>:
                    <div className="select-component-placeholder">{ placeholder || <>&nbsp;</> }</div>
            }</div>
            <div className={ classList({ "select-component-menu": true, open: menuOpen })}>
            { options.length ? options.map((option, i) => {
                return (
                    <div key={i} className={ classList({
                        "select-component-option": true,
                        "selected": option.value === value,
                        disabled: !!option.disabled,
                        highlighted: highlightedIndex === i && !option.disabled
                    })}
                    onMouseOver={() => {
                        if (!option.disabled) {
                            setHighlightedIndex(i)
                        }
                    }}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseUp={() => {
                        if (!option.disabled) {
                            onChange(option.value)
                            closeMenu()
                        }
                    }}>
                        { option.icon && <Icon arg={ option.icon }/> } <span>{ option.label }</span> {
                            option.right && <span className="right">{ option.right }</span>
                        }
                    </div>    
                )
            }) : <div className="center color-muted small nowrap">&nbsp; No options defined &nbsp;</div> }
            </div>
        </div>
    )
}
