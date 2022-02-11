import DB from "../../../mocks/views"


export default function ColumnSelector({
    db = DB,
    disabled = [],
    comparator = (a, b) => a.name.localeCompare(b.name),
    addEmptyOption = "none",
    filter = () => true,
    ...props
}: {

    /**
     * Array of values that should be rendered as disabled
     */
    disabled?: string[]

    /**
     * Array of tables containing columns
     */
    db?: app.TableDescriptor[]

    /**
     * A function used to sort the options
     */
    comparator?: (a: app.ColumnDescriptor, b: app.ColumnDescriptor) => number

    addEmptyOption?: "start" | "end" | "none"

    /**
     * A function to filter out unwanted options
     */
    filter?: (tableName: string, columnName: string) => boolean

    /**
     * Other props to be passed to the select element
     */
    [key: string]: any
})
{
    return (
        <select { ...props }>
            { addEmptyOption === "start" && <option/> }
            { db.map((table, i) => {
                return (
                    <optgroup key={i} label={ table.name }>
                         { table.columns.filter(col => filter(table.name, col.name)).sort(comparator).map((col, y) => {
                             const fullName = `${table.name}.${col.name}`
                             return (
                                <option
                                    key={i + "." + y}
                                    value={ fullName }
                                    disabled={ disabled.includes(fullName) }
                                    data-column={col.name}
                                    data-table={table.name}
                                >{ fullName }</option>
                            )
                        }) }
                    </optgroup>
                )
            }) }
            { addEmptyOption === "end" && <option/> }
        </select>
    )
}