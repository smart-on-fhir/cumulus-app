import Checkbox from "../Checkbox"


interface CheckboxListDataItem {
    id?: number | string
    name: string
    description?: string | JSX.Element | null
    [key: string]: any
}

export default function CheckboxList({
    items,
    toggle,
    isSelected
}: {
    items     : CheckboxListDataItem[]
    toggle    : (item: CheckboxListDataItem) => void
    isSelected: (item: CheckboxListDataItem) => boolean
}) {
    return (
        <>
            { items.map((item, i) => (
                <Checkbox
                    checked={ isSelected(item) }
                    onChange={ () => toggle(item) }
                    name={ item.name }
                    label={ String(item.label || item.name) }
                    description={ item.description || undefined }
                    className="mb-1"
                    key={i}
                />
            ))}
        </>
    )
}