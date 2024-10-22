import { classList } from "../../../utils"
import { app }       from "../../../types"
import Prefetch      from "../../generic/Prefetch"
import "./LinkWidget.scss"


export default function LinkWidget({ onChange, value }: { onChange: (selection: string) => void, value?: string })
{
    return (
        <Prefetch path="/api/request-groups?subscriptions=true">{
            (data: app.SubscriptionGroup[]) => <Root data={data} onChange={onChange} value={value} />
        }</Prefetch>
    )
}

function Root({
    data,
    onChange,
    value = ""
}: {
    data: app.SubscriptionGroup[]
    onChange: (selection: string) => void
    value?: string
})
{
    const selection = value.split(",").filter(Boolean).map(parseFloat)

    return (
        <div tabIndex={0} className="form-control link-widget" style={{ maxHeight: "none" }}>
            <div>
            { data.map((group, i) => (
                <SubscriptionGroup
                    key={i}
                    group={group}
                    selection={selection}
                    onChange={selection => onChange(selection.join(","))}
                />
            )) }
            </div>
        </div>
    )
}

function SubscriptionGroup({
    group,
    onChange,
    selection
}: {
    group: app.SubscriptionGroup
    selection: number[]
    onChange: (selection: number[]) => void
})
{

    const isSelected = group.requests.every(s => selection.includes(s.id))
    const isIndeterminate = !isSelected && group.requests.some(s => selection.includes(s.id))

    function toggle() {
        const rest = [...selection].filter(id => !group.requests.find(s => s.id === id))
        if (isSelected) {
            onChange(rest)
        } else {
            onChange([...rest, ...group.requests.map(s => s.id)])
        }
    }

    if (!group.requests?.length) {
        return (
            <details>
                <summary>
                    <label>
                        <span className="icon material-symbols-rounded color-grey">check_box_outline_blank</span>
                        <span className="icon icon-2 material-symbols-rounded color-brand-2">folder</span>
                        {group.name}
                    </label>
                </summary>
                <summary>
                    <span className="icon icon-3 material-symbols-rounded color-red">block</span>
                    No subscriptions in this group
                </summary>
            </details>
        )
    }
    return (
        <details open>
            <summary className={classList({
                selected: false
            })}>
                <label onMouseDown={() => toggle()} title="Click to automatically include/exclude all subscriptions in this group">
                    <span className="icon material-symbols-rounded color-blue">{
                        isIndeterminate ?
                            "indeterminate_check_box" :
                            isSelected ?
                                "check_box" :
                                "check_box_outline_blank"
                        }
                    </span>
                    <span className="icon icon-2 material-symbols-rounded color-brand-2">
                        folder_open
                    </span>
                    {group.name}
                </label>
            </summary>
            { group.requests.map((subscription, i) => (
                <Subscription
                    key={i}
                    subscription={ subscription }
                    selected={ selection.includes(subscription.id) }
                    onChange={selected => {
                        if (selected) {
                            onChange([...selection, subscription.id])
                        } else {
                            onChange([...selection].filter(id => id !== subscription.id))
                        }
                    }}
                />
            ))}
        </details>
    )
}

function Subscription({
    subscription,
    onChange,
    selected
}: {
    subscription: app.Subscription
    onChange: (selected: boolean) => void
    selected: boolean
})
{
    return (
        <details className={classList({ subscription: true, selected })}>
            <summary>
                <label onMouseDown={() => onChange(!selected)}>
                    <span className="icon material-symbols-rounded color-blue">
                        { selected ? "check_box" : "check_box_outline_blank" }
                    </span>
                    <span className="icon icon-2 material-symbols-rounded">database</span>
                    {subscription.name}
                    <b className="badge">{subscription.Views?.length || 0}</b>
                </label>
            </summary>
            { subscription.Views && subscription.Views.length ? (
                <>
                    { subscription.Views.map((v, y) => (
                        <summary key={y}>
                            <span className="icon icon-3 material-symbols-rounded color-green">grouped_bar_chart</span>
                            {v.name}
                        </summary>
                    ))}
                </>
            ) : <summary>
                    <span className="icon icon-3 material-symbols-rounded color-red">block</span>
                    This subscription has no graphs yet
                </summary>
            }
        </details>
    )
}
