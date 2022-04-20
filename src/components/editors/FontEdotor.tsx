import { merge } from "highcharts"
import { Component, FocusEvent, KeyboardEvent, useState } from "react"
import { classList } from "../../utils"
import "./editors.scss"


function PropertyEditor({
    name,
    value,
    onValueChange,
    onNameChange,
    onChange,
    path = [],
    isOpen = false,
    readOnlyPaths
}: {
    name: string,
    value?: string | number | boolean | null,
    onValueChange: (value?: string | number | boolean | null) => void
    onNameChange: ((name: string) => void) | null
    onChange: (obj: Record<string, any>) => void
    path?: (string|number)[]
    isOpen?: boolean,
    readOnlyPaths: string[]
}) {
    const [ _name , setName  ] = useState(name );
    const [ _value, setValue ] = useState(JSON.stringify(value));
    const [ open  , setOpen  ] = useState(isOpen);
    
    let type: string;
    try {
        type = typeof JSON.parse(_value + "")
    } catch {
        if (_value === undefined) {
            type = "undefined"
        } else {
            type = _value === "<New Value>" ? "" : "txt"
        }
    }

    const onValueBlur = (e: FocusEvent<HTMLInputElement>) => {
        try {
            var _v = JSON.parse(e.target.value)
        } catch {
            return
        }
        if (_v !== _value) {
            onValueChange(_v)
        }
    }

    const onNameBlur = () => {
        if (_name !== name) {
            onNameChange!(_name)
        }
    }

    const isReadOnly = readOnlyPaths.includes([...path, name].join("."))

    if (value && typeof value === "object") {
        const isArray = Array.isArray(value)
        return (
            <>
                <div className={ classList({
                    "dynamic-editor": true,
                    open: !!open,
                    readonly: isReadOnly
                }) } title={
                    isReadOnly ? "This property cannot be editted!" : undefined
                }>
                    <i className={ "fa-solid fa-caret-" + (open ? "down" : "right") } onClick={() => setOpen(!open) } />
                    <input
                        type="text"
                        placeholder="New Entry"
                        name="name"
                        value={ _name === "<New Entry>" ? "" : _name }
                        onChange={ e => setName(e.target.value) }
                        onBlur={onNameBlur}
                        size={ _name.length }
                    /><b>:&nbsp;</b>
                    <b>{ isArray ? "[" : "{" }</b>
                    { !open && <code>{ JSON.stringify(value).replace(/^.|.$/g, "") }</code> }
                    { open && <span className="add" onClick={() => onChange(
                            isArray ? [...value, "<New Value>"] : {...value as object, "<New Entry>": "<New Value>"}
                        )}>Add Property</span>
                     }
                    { !open && <b>{ isArray ? "]" : "}" }</b> }
                
                    { open && <ObjectEditor
                        readOnlyPaths={readOnlyPaths}
                        obj={value}
                        onChange={o => onChange(merge(value, o))}
                        path={[...path, _name]}
                    /> }

                    { open && <div><b>{ isArray ? "]" : "}" }</b></div> }
                </div>
            </>
        )
    }

    const displayValue = _value === "<New Value>" ?
        "" :
        typeof value === "function" ?
            "<Function>" :
            value === undefined ?
                "undefined" :
                String(_value);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            if (type === "number") {
                e.preventDefault()
                try {
                    e.currentTarget.value = String(JSON.parse(e.currentTarget.value) + 1);
                    e.currentTarget.size = e.currentTarget.value.length;
                } catch {}
            }
        }
        else if (e.key === "ArrowDown") {
            if (type === "number") {
                e.preventDefault()
                try {
                    e.currentTarget.value = String(JSON.parse(e.currentTarget.value) - 1);
                    e.currentTarget.size = e.currentTarget.value.length;
                } catch {}
            }
        }
        else if (e.key === "Enter") {
            e.preventDefault()
            onValueBlur(e as any)
        }
        else if (e.key === "Escape") {
            e.preventDefault()
            onValueBlur(e as any)
        }
    };

    return (
        <div className={ classList({
            "dynamic-editor": true,
            readonly: isReadOnly
        }) } title={
            isReadOnly ? "This property cannot be editted!" : undefined
        }>
            { !!onNameChange && <><input
                type="text"
                name="name"
                placeholder="New Entry"
                value={ _name === "<New Entry>" ? "" : _name }
                onChange={ e => setName(e.target.value) }
                onBlur={ onNameBlur }
                size={ _name.length }
            /><b>:&nbsp;</b></> }                                       
            <input
                type="text"
                name="value"
                placeholder="Enter valid JSON"
                value={ displayValue }
                onChange={ e => setValue(e.target.value) }
                className={type}
                size={ displayValue.length }
                onBlur={onValueBlur}
                onKeyDown={onKeyDown}
                autoComplete="off"
            />
        </div>
    )
}

class ObjectEditor extends Component<{
    obj: Record<string, any> | any[]
    onChange: (obj: Record<string, any>) => void
    path: (string|number)[]
    readOnlyPaths: string[]
}>
{
    getKey(name: string | number, value: any) {
        let key = [...this.props.path, name].join(".") + "=";
        if (Array.isArray(value)) {
            key += `Array(${value.length})`
        }
        else if (typeof value === "function") {
            key += "[function]"
        }
        else {
            key += String(value)
        }
        return key
    }

    render() {
        const { obj, onChange, path, readOnlyPaths } = this.props;
        
        return Array.isArray(obj) ? obj.map((value, i) => (
            <PropertyEditor
                readOnlyPaths={readOnlyPaths}
                key={ this.getKey(i, value) }
                path={[...path]}
                name={i + ""}
                value={value}
                onValueChange={
                    _value => {
                        let a = obj.slice()
                        a[i] = _value
                        onChange(a)
                    }
                }
                onNameChange={ null }
                onChange={(o) => {
                    let a = obj.slice()
                    a[i] = o
                    onChange(a)
                }}
            />
        )): Object.keys(obj).map(name => (
            <PropertyEditor
                readOnlyPaths={readOnlyPaths}
                key={this.getKey(name, obj[name])}
                path={[...path]}
                name={name}
                value={obj[name]}
                onValueChange={v => {
                    // console.log('%o changed from %o to %o', [...path, name].join("."), obj[name], v)
                    onChange({ ...obj, [name]: v })
                }}
                onNameChange={ Array.isArray(obj[name]) ? null : x => {
                    // console.log('%o renamed to %o', [...path, name].join("."), x, onChange)
                    let o: any = merge(obj)
                    
                    if (x) {
                        o[x] = obj[name];
                    }

                    o[name] = undefined;
                    onChange(o)
                }}
                onChange={o => onChange({ ...obj, [name]: o })}
            />
        ))
    }
}


interface DynamicEditorProps {
    obj: Record<string, any>
    onChange: (obj: Record<string, any>) => void
    readOnlyPaths?: string[]
}

export class DynamicEditor extends Component<DynamicEditorProps>
{
    render() {
        const { onChange, obj, readOnlyPaths = [] } = this.props;
        return (
            <div className="dynamic-editor-wrap">
                <ObjectEditor obj={ obj } onChange={ onChange } path={[]} readOnlyPaths={ readOnlyPaths } />
            </div>
        )
    }
}
