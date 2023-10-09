import { merge } from "highcharts"
import { ReactNode } from "react"
import { EditableGroupProperty, EditableProperty } from "../../generic/PropertyGrid/types"
import ChartOptionsSchema from "./schema"
export { DEFS } from "./definitions"
export * as ChartOptionsSchema from "./schema"


type GridItem = string | {
    name: string
    description?: string | ReactNode
    open?: boolean
    type?: string
    id?: string
    value: GridItem[]
}

function getPropEditor(root: Record<string, any>, onChange: (x: Partial<typeof root>) => void, item: GridItem): EditableProperty | EditableGroupProperty {

    if (item && typeof item === "object") {
        if (item.type === "group") {
            return {
                ...item,
                value: Object.values(item.value).map((x: any) => getPropEditor(root, onChange, x))
            } as EditableGroupProperty
        }
        return { ...item } as EditableProperty
    }
    
    const path = String(item).split(".")
    const meta = { ...path.reduce((prev: any, cur) => prev?.[cur], ChartOptionsSchema) }
    const node =      path.reduce((prev: any, cur) => prev?.[cur], root)
    const value = meta.value ?? node ?? meta.defaultValue

    if (Array.isArray(value)) {
        return {
            ...meta,
            value: Array.isArray(value) ? value.map(v => {
                v.onChange = (x: any) => {
                    const patch = {};
                    [...path, v.id].reduce((prev: any, cur, i, all) => {
                        prev[cur] = i === all.length - 1 ? x : {}
                        return prev[cur]
                    }, patch)
                    onChange(merge(root, patch))
                }
                v.value = node[v.id] ?? meta.defaultValue
                return v
            }) : value
        }
    }

    return {
        name: path[path.length-1],
        ...meta,
        value,
        onChange: (x: any) => {
            const patch = {};
            [...path].reduce((prev: any, cur, i, all) => {
                prev[cur] = i === all.length - 1 ? x : {}
                return prev[cur]
            }, patch)
            // console.log("patch ===>", patch)
            onChange(merge(root, patch))
        }
    }
}

export function getEditorPropsFromSchemaPaths(root: Record<string, any>, onChange: (x: Partial<typeof root>) => void, items: GridItem[]) {
    return items.map(item => getPropEditor(root, onChange, item))
}
