import moment from "moment"

export function Format({ value, format }: {
    value: any
    format: string
})
{
    if (format === "date") {
        if (!value) {
            return <span className="color-muted">No Data</span>
        }
        return <span>{ moment(value).format("LL") }</span>
    }
    
    if (format === "date-time") {
        if (!value) {
            return <span className="color-muted">No Data</span>
        }
        return <span>{ moment(value).format("LLLL") }</span>
    }

    return <span>{ value + "" }</span>
}