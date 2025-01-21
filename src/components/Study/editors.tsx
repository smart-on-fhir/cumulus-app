import { AlertError } from "../generic/Alert"
import Checkbox from "../generic/Checkbox"
import Grid from "../generic/Grid"

import {
    EnumParameterDescriptor,
    NumberParameterDescriptor,
    schema,
    Template,
    type BooleanParameterDescriptor,
    type DateParameterDescriptor,
    type ParameterDescriptor
} from "./Schema"

function ifTrue(state: Record<string, any>, expr: string, y:any = true, n:any = false) {
    // eslint-disable-next-line no-new-func
    return Function(
        Object.keys(state).join(","), `if (${expr}) { return ${y}; } return ${n};`
    )(...Object.values(state))
}

function parseRuntimeParams(params: Record<string, any>, state: Record<string, any>) {
    const out: Record<string, any> = {}
    for (const paramName in params) {
        const paramValue = params[paramName]
        if (typeof paramValue === "string") {
            let match = paramValue.match(/^\s*\$([a-zA-Z0-9]+)\s*$/)
            // console.log(paramName, paramValue, match)
            if (match && match[1]) {
                out[paramName] = state[match[1]]
                continue;
            }

            match = paramValue.match(/^\s*ifTrue\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*$/)
            if (match) {
                out[paramName] = ifTrue(state, match[1], match[2], match[3])
                continue;
            }

            match = paramValue.match(/^\s*ifTrue\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*$/)
            if (match) {
                out[paramName] = ifTrue(state, match[1], match[2])
                continue;
            }

            match = paramValue.match(/^\s*ifTrue\(\s*(.+?)\s*\)\s*$/)
            if (match) {
                out[paramName] = ifTrue(state, match[1])
                continue;
            }
            // ifTrue
        }
        out[paramName] = paramValue
    }
    // console.log(out)
    return out
}

export function Editor({
    descriptor,
    value = "",
    onChange,
    runtimeParams = {}
}: {
    descriptor: ParameterDescriptor
    value: any
    onChange: (x: typeof value) => void
    runtimeParams?: Record<string, any>
}) {
    if (descriptor.type === "date") {
        return <DateEditor descriptor={descriptor} {...runtimeParams} value={value} onChange={onChange} />
    }
    if (descriptor.type === "boolean") {
        return <BooleanEditor descriptor={descriptor} {...runtimeParams} value={value} onChange={onChange} />
    }
    if (descriptor.type === "number") {
        return <NumberEditor descriptor={descriptor} {...runtimeParams} value={value} onChange={onChange} />
    }
    if (descriptor.type === "enum") {
        return <EnumEditor descriptor={descriptor} {...runtimeParams} value={value} onChange={onChange} />
    }
    return <b>{descriptor.type} editor not implemented</b>
}

export function DateEditor({
    descriptor,
    value = "",
    onChange,
    disabled,
    max,
    min
}: {
    descriptor: DateParameterDescriptor
    max?: number
    min?: number
    value: string
    disabled?: boolean
    onChange: (date: string) => void
}) {
    const { name, description } = descriptor
    return (
        <div>
            <label>
                <i className="fa-regular fa-calendar-days color-blue" /> { name }
            </label>
            <input
                type="date"
                value={ value }
                max={ max }
                min={ min }
                onChange={ e => onChange(e.target.value) }
                disabled={disabled}
            />
            { !!description && <p className="color-muted mb-05">{ description }</p> }
        </div>
    )
}

export function BooleanEditor({
    descriptor,
    value = "",
    onChange
}: {
    descriptor: BooleanParameterDescriptor
    value: string
    onChange: (on: boolean) => void
}) {
    const { name, description } = descriptor
    return (
        <div>
            <label>&nbsp;</label>
            <label style={{ padding: "0.2em 0 0.2em 0" }}>
                <Checkbox
                    name=""
                    checked={ !!value }
                    onChange={ onChange }
                    label={ <b>{ name }</b> }
                    description={ <span style={{ fontSize: "1rem" }}>{ description }</span> }
                />
            </label>
        </div>
    )
}

export function NumberEditor({
    descriptor,
    value,
    onChange,
    max,
    min
}: {
    descriptor: NumberParameterDescriptor
    max?: number
    min?: number
    value: number
    onChange: (value: number) => void
}) {
    const { name, description } = descriptor
    return (
        <div>
            <label>{ name }</label>
            <input
                type="number"
                value={ value }
                max={ max }
                min={ min }
                onChange={ e => onChange(e.target.valueAsNumber) }
            />
            { !!description && <p className="color-muted mb-05">{ description }</p> }
        </div>
    )
}

export function EnumEditor({
    descriptor,
    value,
    onChange
}: {
    descriptor: EnumParameterDescriptor
    value: string
    onChange: (value: string) => void
}) {
    const { name, description } = descriptor
    return (
        <div>
            <label>{ name }</label>
            <select value={ value } onChange={ e => onChange(e.target.value) }>
                { descriptor.values.map(({ value, label }, i) => (<option key={i} value={value}>{ label ?? value }</option>)) }
            </select>
            { !!description && <p className="color-muted mb-05">{ description }</p> }
        </div>
    )
}

export function TemplateEditor({
    templateId,
    state,
    onChange
}: {
    templateId: string,
    state: Record<string, any>,
    onChange: (data: Record<string, any>) => void
}) {
    const template = schema.templates.find(t => t.id === templateId) as Template;

    if (!template) {
        return <AlertError>Template with ID if "{ templateId }" was not found</AlertError>
    }

    if (!Array.isArray(template.variables) || !template.variables.length) {
        return <AlertError>Template with ID "{ templateId }" has no variables defined</AlertError>
    }

    const sections: Record<string, any[]> = { __GENERAL__ : [] };

    for (const variable of template.variables) {
        const { id, section = "__GENERAL__" } = variable
        const descriptor = schema.parameters[id];

        if (!descriptor) {
            return <AlertError>Variable with ID "{id}" was not found</AlertError>
        }

        if (section) {
            if (!sections[section]) {
                sections[section] = []
            }
            sections[section].push({ ...descriptor, ...variable })
        }
    }

    function renderSection(items: any[]) {

        const groups: Record<string, any[]> = { __GENERAL__ : [] };

        for (const item of items) {
            const { group = "__GENERAL__" } = item
            if (!groups[group]) {
                groups[group] = []
            }
            groups[group].push(item)
        }

        return <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem" }}>
            { Object.keys(groups).map(group => {
                if (!groups[group].length) {
                    return null
                }
                // return <Grid cols={ groups[group].map(x => "minmax(16rem, 1fr)").join(" ") } gap="2rem" className="mt-1 mb-4" key={group}>
                return <Grid cols="15rem" gap="1rem 2rem" key={group} style={{ flex: "1 0 10rem" }}>
                    { groups[group].map(item => {
                        return <Editor
                            key={item.id}
                            descriptor={ item }
                            value={ state[item.id] }
                            runtimeParams={ parseRuntimeParams(item, state) }
                            onChange={value => onChange({ [item.id]: value })}
                        />
                    })}
                </Grid>
            }) }
            </div>
    }

    return (
        <>
            { Object.keys(sections).map(sectionId => {
                const items = sections[sectionId]

                if (!items.length) {
                    return null
                }

                const section = schema.sections?.[sectionId]

                if (!section && sectionId !== "__GENERAL__") {
                    return <AlertError>Section with ID "{ sectionId }" was not found</AlertError>
                }

                return (
                    <div key={sectionId}>
                        { section && <h4 className="color-blue-dark center mb-1">{ section.name }</h4> }
                        { section && !!section.description && <div className="color-muted mb-1 center">{ section.description }</div> }
                        { section && <hr className="small color-grey mb-2" /> }
                        { renderSection(items) }
                    </div>
                )
            }) }
        </>
    )
}