

export default function ColumnSelector({
    cols,
    disabled = [],
    comparator = (a, b) => a.name.localeCompare(b.name),
    addEmptyOption = "none",
    filter = () => true,
    emptyLabel = "",
    ...props
}: {

    /**
     * Array of values that should be rendered as disabled
     */
    disabled?: string[]

    /**
     * Array of tables containing columns
     */
    cols: app.DataRequestDataColumn[]

    /**
     * A function used to sort the options
     */
    comparator?: (a: app.ColumnDescriptor, b: app.ColumnDescriptor) => number

    addEmptyOption?: "start" | "end" | "none"

    /**
     * A function to filter out unwanted options
     */
    filter?: (col: app.DataRequestDataColumn) => boolean

    /**
     * Other props to be passed to the select element
     */
    [key: string]: any

    emptyLabel?: string
})
{
    return (
        <select { ...props }>
            { addEmptyOption === "start" && <option className="empty-option">{emptyLabel}</option> }
            { cols.filter(filter).sort(comparator).map((col, i) => (
                <option
                    key={i}
                    value={ col.name }
                    disabled={ disabled.includes(col.name) }
                >{ col.label || col.name }</option>
            )) }
            { addEmptyOption === "end" && <option className="empty-option">{emptyLabel}</option> }
        </select>
    )
}