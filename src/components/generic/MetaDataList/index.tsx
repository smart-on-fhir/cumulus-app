import { ReactNode } from "react"
import IconItem      from "../IconItem"


interface Item {
    label: ReactNode
    value: ReactNode
    icon?: string
}

export default function MetaDataList({
    items
}: {
    /** Note: falsy values are allowed but not rendered */
    items: (Item | false | null | undefined)[]
}) {
    return (
        <>
            { items.filter(Boolean).map((item: Item, i) => (
                <IconItem key={i} icon={item.icon || "info"} className="mb-1">
                    <b>{item.label}</b>
                    <div className="color-muted">{item.value}</div>
                </IconItem>
            ))}
        </>
    )
}