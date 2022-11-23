import { useState } from "react"
import { classList } from "../../../utils"
import Wrapper from "../../generic/EndpointListWrapper"
import "./LinkWidget.scss"

enum SelectionState {
    SELECTED,
    UNSELECTED,
    SELECTED_INHERIT,
    UNSELECTED_INHERIT
}

interface Selectable<T> {
    data    : T
    selected: SelectionState
}

interface Selection {
    groups       : Record<number, SelectionState>
    subscriptions: Record<number, SelectionState>
}

export default function LinkWidget()
{
    return (
        <Wrapper endpoint="/api/request-groups?subscriptions=true">{
            (data: app.RequestGroup[]) => <Root data={data} />
        }</Wrapper>
    )
}

function Root({ data }: { data: app.RequestGroup[] })
{
    const [selection, setSelection] = useState<Selection>({
        groups       : {},
        subscriptions: {}
    })

    function onChange(type: "groups" | "subscriptions", id: number, selected: SelectionState, groupId: number) {

        const nextSelection = {
            groups: { ...selection.groups },
            subscriptions: { ...selection.subscriptions }
        };

        if (type === "groups") {
            nextSelection.groups[id] = selected
            data.find(g => g.id === id)?.requests.forEach(r => {
                nextSelection.subscriptions[r.id] = selected === SelectionState.SELECTED ?
                    SelectionState.SELECTED_INHERIT :
                    SelectionState.UNSELECTED
            })
        } else {
            nextSelection.subscriptions[id] = selected
            // nextSelection.groups[groupId] = SelectionState.UNSELECTED_INHERIT
        }

        setSelection(nextSelection)
    }

    return (
        <div tabIndex={0} className="form-control link-widget" style={{ maxHeight: "none" }}>
            <div>
            { data.map((group, i) => (
                <SubscriptionGroup
                    key={i}
                    group={{
                        data    : group,
                        selected: selection.groups[group.id]
                    }}
                    selection={selection}
                    onChange={onChange}
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
    group: Selectable<app.RequestGroup>
    selection: Selection
    onChange: (type: "groups" | "subscriptions", id: number, selected: SelectionState, groupId: number) => void
})
{
    // const selected = selection.subscriptions
    return (
        <details open>
            <summary className={classList({
                selected: group.selected === SelectionState.SELECTED
            })}>
                <label onMouseDown={() => onChange(
                    "groups",
                    group.data.id,
                    group.selected === SelectionState.SELECTED ?
                        SelectionState.UNSELECTED :
                        SelectionState.SELECTED,
                    group.data.id
                )} title="Click to automatically include/exclude all data subscriptions in this group">
                    <span className="icon material-symbols-rounded color-blue">{
                        group.selected === SelectionState.SELECTED_INHERIT ||
                        group.selected === SelectionState.UNSELECTED_INHERIT ?
                            "indeterminate_check_box" :
                            group.selected === SelectionState.SELECTED ?
                                "check_box" :
                                "check_box_outline_blank"
                        }
                    </span>
                    <span className="icon icon-2 material-symbols-rounded color-brand-2">
                        folder_open
                    </span>
                    {group.data.name}
                </label>
            </summary>
            { group.data.requests.map((subscription, i) => (
                <Subscription
                    key={i}
                    subscription={{
                        data    : subscription,
                        selected: selection.subscriptions[subscription.id]
                    }}
                    onChange={selected => {
                        onChange("subscriptions", subscription.id, selected, group.data.id)
                    }}
                />
            )) }
        </details>
    )
}

function Subscription({
    subscription,
    onChange
}: {
    subscription: Selectable<app.DataRequest>
    onChange: (selected: SelectionState) => void
})
{
    const { selected } = subscription

    return (
        <details
            className={classList({
                subscription: true,
                selected    : (
                    selected === SelectionState.SELECTED ||
                    selected === SelectionState.SELECTED_INHERIT
                ),
                disabled    : (
                    selected === SelectionState.SELECTED_INHERIT ||
                    selected === SelectionState.UNSELECTED_INHERIT
                )
            })}
        >
            <summary>
                <label onMouseDown={() => onChange(
                    selected === SelectionState.SELECTED ?
                        SelectionState.UNSELECTED :
                        SelectionState.SELECTED
                )}>
                    <span className="icon material-symbols-rounded color-blue">{
                        selected === SelectionState.SELECTED ?
                            "check_box" :
                            selected === SelectionState.SELECTED_INHERIT ? 
                                "link" : // "add_link" :
                                "check_box_outline_blank"
                        }
                    </span>
                    <span className="icon icon-2 material-symbols-rounded">database</span>
                    {subscription.data.name}
                    <b className="badge">{subscription.data.Views?.length || 0}</b>
                </label>
            </summary>
            {subscription.data.Views && subscription.data.Views.length ? (
                <>{ subscription.data.Views.map((v, y) => (
                    <summary key={y}>
                        <span className="icon icon-3 material-symbols-rounded color-green">
                            grouped_bar_chart
                        </span>
                        {v.name}
                    </summary>
                ))}
                </>
            ) : <summary>
                    <span className="icon icon-3 material-symbols-rounded color-red">
                    block
                    </span>
                    This subscription has no graphs yet
                </summary>
            }
        </details>
    )
}
