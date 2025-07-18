import Select  from "../generic/Select"
import { app } from "../../types"
import Grid from "../generic/Grid"


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
        right   : <Grid cols="1fr 6ch" className="middle small" gap="0.25em">
            <div>
                { <small data-tooltip={ col.distinct_values_count ? `${Number(col.distinct_values_count).toLocaleString()} distinct values` : undefined}>
                    { col.distinct_values_count ? Number(col.distinct_values_count).toLocaleString() : "" }
                </small> }
            </div>
            <span className={ col.dataType }> {
                (col.dataType || col.type)
                    .replace(/date:YYYY-MM-DD/, "day")
                    .replace(/date:YYYY-MM/, "month")
                    .replace(/date:YYYY/, "year")
                    .replace(/date:YYYY wk W/, "week")
                    .replace(/boolean/i, "bool")
                    .replace(/integer/i, "int")
            }</span>
        </Grid>
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