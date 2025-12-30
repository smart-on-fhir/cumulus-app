import { classList }  from "../../utils"
import { AlertError } from "../generic/Alert"
import Checkbox       from "../generic/Checkbox"
import CheckboxList   from "../generic/CheckboxList"
import Collapse       from "../generic/Collapse"
import Grid           from "../generic/Grid"
import Markdown       from "../generic/Markdown"
import RichSelect, { RichSelectOption } from "../generic/RichSelect"

import {
    EnumParameterDescriptor,
    NumberParameterDescriptor,
    schema,
    Template,
    type BooleanParameterDescriptor,
    type DateParameterDescriptor,
    type ParameterDescriptor,
    type CheckListParameterDescriptor,
    type StringParameterDescriptor,
    type ListParameterDescriptor
} from "./Schema"

function ifTrue(state: Record<string, unknown>, expr: string, y:any = true, n:any = false) {
    // eslint-disable-next-line no-new-func
    return Function(
        Object.keys(state).join(","), `if (${expr}) { return ${y}; } return ${n};`
    )(...Object.values(state))
}

function parseRuntimeParams(params: Record<string, unknown>, state: Record<string, unknown>) {
    const out: Record<string, unknown> = {}
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
    value,
    onChange,
    runtimeParams = {}
}: {
    descriptor: ParameterDescriptor
    value: unknown
    onChange: (x: typeof value) => void
    runtimeParams?: Record<string, unknown>
}) {
    if (descriptor.type === "date") {
        return <DateEditor descriptor={descriptor} {...runtimeParams} value={value + ""} onChange={onChange} />
    }
    if (descriptor.type === "boolean") {
        return <BooleanEditor descriptor={descriptor} {...runtimeParams} value={value + ""} onChange={onChange} />
    }
    if (descriptor.type === "number") {
        return <NumberEditor descriptor={descriptor} {...runtimeParams} value={+value} onChange={onChange} />
    }
    if (descriptor.type === "enum") {
        return <EnumEditor descriptor={descriptor} {...runtimeParams} value={value + ""} onChange={onChange} />
    }
    if (descriptor.type === "checklist") {
        return <CheckListEditor descriptor={descriptor} {...runtimeParams} value={value as unknown[]} onChange={onChange} />
    }
    if (descriptor.type === "string") {
        return <StringEditor descriptor={descriptor} value={value + ""} onChange={onChange} />
    }
    if (descriptor.type === "list") {
        return <ListEditor descriptor={descriptor} value={(value || descriptor.defaultValue) as RichSelectOption | RichSelectOption[]} onChange={onChange} />
    }
    // @ts-ignore
    return <b>{descriptor.type} editor not implemented</b>
}

export function CheckListEditor({
    descriptor,
    value = [],
    onChange,
    defaultValue
}: {
    descriptor: CheckListParameterDescriptor
    value: unknown[]
    onChange: (list: unknown[]) => void
    defaultValue?: unknown[]
}) {

    value = value || defaultValue || [];

    return (
        <div>
            <label>{ descriptor.name } <b className="badge bg-blue">{value.length}</b></label>
            <div className="form-control check-list" style={{ maxHeight: "20rem", overflow: "auto", padding: 4 }}>
                <CheckboxList
                    items={descriptor.items as any}
                    toggle={item => {
                        const list = [...value]
                        const index = value.findIndex(x => JSON.stringify(x) === JSON.stringify(item.value))
                        if (index > -1) {
                            list.splice(index, 1)
                        } else {
                            list.push(item.value)
                        }
                        onChange(list)
                    }}
                    isSelected={item => value.some(x => JSON.stringify(x) === JSON.stringify(item.value))}
                />
            </div>
        </div>
    )
}

export function ListEditor({
    descriptor,
    value,
    onChange
}: {
    descriptor: ListParameterDescriptor
    value: RichSelectOption | RichSelectOption[]
    onChange: (selection: typeof value) => void
}) {
    const { name, description, endpoint, placeholder = "Please select" } = descriptor
    return (
        <div>
            <label>{ name } <b className="badge bg-blue">{Array.isArray(value) ? value.length : value ? 1 : 0}</b></label>
            <RichSelect value={value} onChange={onChange} placeholder={placeholder} endpoint={endpoint} title={name} />
            { !!description && <div className="mb-05 mt-05"><Markdown>{ description }</Markdown></div> }
        </div>
    )
}

export function StringEditor({
    descriptor,
    value = "",
    onChange
}: {
    descriptor: StringParameterDescriptor
    value: string
    onChange: (date: string) => void
}) {
    const { name, description, type, ...rest } = descriptor
    return (
        <div>
            <label>
                { name }
            </label>
            <input
                type="text"
                { ...rest }
                value={ value }
                onChange={ e => onChange(e.target.value) }
            />
            { !!description && <div className="mb-05 mt-05"><Markdown>{ description }</Markdown></div> }
        </div>
    )
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
            <label>{ name }</label>
            <input
                type="date"
                value={ value }
                max={ max }
                min={ min }
                onChange={ e => onChange(e.target.value) }
                disabled={disabled}
            />
            { !!description && <div className="mb-05 mt-05"><Markdown>{ description }</Markdown></div> }
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
        <div className="boolean-editor">
            <label className="empty-label">&nbsp;</label>
            <label className="wrap-label">
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
    onChange: (value: number | string) => void
}) {
    const { name, description } = descriptor
    return (
        <div>
            <label>{ name }</label>
            <input
                type="number"
                value={ value ?? "" }
                max={ max }
                min={ min }
                onChange={ e => onChange(isNaN(e.target.valueAsNumber) ? e.target.value : e.target.valueAsNumber) }
            />
            { !!description && <div className="mb-05 mt-05"><Markdown>{ description }</Markdown></div> }
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
                { descriptor.values.map(({ value, label, title }, i) => (<option key={i} value={value} title={title}>{ label ?? value }</option>)) }
            </select>
            { !!description && <div className="mb-05 mt-05"><Markdown>{ description }</Markdown></div> }
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

        return <Grid cols="18rem" gap="1rem 2rem">
            { Object.keys(groups).map(group => {
                if (!groups[group].length) {
                    return null
                }

                const sets = groupBy(groups[group], "set")

                return Object.keys(sets).map(((name, i) => {
                    if (name === "undefined") {
                        return sets[name].map((item: any) => {
                            return <Editor
                                key={item.id}
                                descriptor={ item }
                                value={ state[item.id] }
                                runtimeParams={ parseRuntimeParams(item, state) }
                                onChange={value => onChange({ [item.id]: value })}
                            />
                        })
                    }
                    return (
                        <div key={group} className="editor-set" style={{ flex: "1 0 10rem" }}>
                            <label>{ name }</label>
                            <Grid cols="7rem" gap="0rem 1rem">
                                { sets[name].map((item: any) => {
                                    return <Editor
                                        key={item.id}
                                        descriptor={ item }
                                        value={ state[item.id] }
                                        runtimeParams={ parseRuntimeParams(item, state) }
                                        onChange={value => onChange({ [item.id]: value })}
                                    />
                                })}
                            </Grid>
                        </div>
                    )
                }))
            }) }
            </Grid>
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

                const valCnt = items.filter(i => {
                    const rec = state[i.id];
                    // console.log(i.id, rec)
                    if (Array.isArray(rec)) return rec.length > 0;
                    return rec !== undefined && rec !== null && rec !== "";
                }).length;

                return (
                    <Collapse header={
                        <div className="row middle" style={{ width: "100%" }} >
                            <div className="col col-0 mr-05">
                                <span className="material-symbols-outlined">home_storage</span>
                            </div>
                            <div className="col">
                                <b className="mr-05">{ section.name }</b>
                            </div>
                            <div className={ classList({
                                "col col-0 small pl-1": true,
                                "color-muted": valCnt < items.length,
                                "color-green": valCnt >= items.length
                            })}>
                                <progress value={ valCnt } max={ items.length } style={{ width: "6rem" }} />
                            </div>
                            <div className="col col-0 color-muted fw-400 small pl-1" data-tooltip={ `${ valCnt } of ${ items.length } parameters have a value` }>
                                { valCnt } / { items.length }
                            </div>
                        </div>
                    } key={sectionId}>
                        <div className="p-2 pb-3 mb-1">
                            { section && !!section.description && <div className="mb-2">{ section.description }</div> }
                            { renderSection(items) }
                        </div>
                    </Collapse>
                )
            }) }
        </>
    )
}

function groupBy(records: Record<string, any>[], propName: string) {
    const groups: Record<string, typeof records> = {};
    for (const item of records) {
        const group = item[propName] + ""
        if (!groups[group]) {
            groups[group] = []
        }
        groups[group].push(item)
    }
    return groups
}
