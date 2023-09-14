export interface EditableProperty {
    name: string
    value?: any
    description?: string
    type: "boolean" | "number" | "length" | "color" | "options" | "shadow" | string
    onChange: (value?: any) => void
    group?: boolean
    disabled?: boolean
    [key: string]: any
}

export interface EditableNumberProperty extends EditableProperty {
    value?: number
    type: "number"
    onChange: (value?: number) => void
    min?: number
    max?: number
    step?: number
}

export interface EditableGroupProperty {
    name: string | JSX.Element
    type: "group"
    value: EditableProperty[]
}