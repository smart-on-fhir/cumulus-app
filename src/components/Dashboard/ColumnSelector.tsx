import Select  from "../generic/Select"
import { app } from "../../types"


export default function ColumnSelector({
    cols,
    disabled = [],
    comparator = (a, b) => a.name.localeCompare(b.name),
    addEmptyOption = "none",
    filter = () => true,
    placeholder,
    ...props
}: {

    /**
     * Array of values that should be rendered as disabled
     */
    disabled?: string[]

    /**
     * Array of tables containing columns
     */
    cols: app.SubscriptionDataColumn[]

    /**
     * A function used to sort the options
     */
    comparator?: (a: app.ColumnDescriptor, b: app.ColumnDescriptor) => number

    addEmptyOption?: "start" | "end" | "none"

    /**
     * A function to filter out unwanted options
     */
    filter?: (col: app.SubscriptionDataColumn) => boolean

    /**
     * Other props to be passed to the select element
     */
    [key: string]: any

    placeholder?: string
})
{
    const options: any[] = cols.filter(filter).sort(comparator).map((col, i) => ({
        value   : col.name,
        disabled: disabled.includes(col.name),
        icon    : "/icons/column.png",
        label   : col.label || col.name,
        right   : <span className={ col.dataType + " color-muted small right" }> {
            col.dataType
                .replace(/date:YYYY-MM-DD/, "Day")
                .replace(/date:YYYY-MM/, "Month")
                .replace(/date:YYYY-MM/, "Year")
                .replace(/date:YYYY wk W/, "Week")
        }</span>
    }));

    if (addEmptyOption !== "none") {
        const emptyOption = {
            value   : null,
            icon    : "fas fa-close color-red",
            label   : "NONE"
        };

        if (addEmptyOption === "end") {
            options.push(emptyOption)
        } else {
            options.unshift(emptyOption)
        }
    }

    return (
        <Select
            options={ options }
            placeholder={ placeholder }
            value={ props.value }
            onChange={ props.onChange }
            right={ !!props.right }
        />
    )
}