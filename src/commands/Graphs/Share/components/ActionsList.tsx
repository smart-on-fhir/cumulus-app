import Checkbox from "../../../../components/generic/Checkbox"


// The following actions are disabled if "read" is not checked
const READ_DEPENDENT = [
    "update",
    "delete",
    "share"
]

export default function ActionsList({
    actions,
    onChange
}: {
    actions : Record<string, { selected: boolean }>
    onChange: (actions: Record<string, { selected: boolean }>) => void
})
{
    function isSelected(action: keyof typeof actions) {
        return actions[action].selected
    }
    
    return <>
        { Object.keys(actions).map(action => {
            const o = actions[action];
            
            const disabled = (action !== "read" && READ_DEPENDENT.includes(action) && !isSelected("read"));
            
            return <Checkbox
                key={action}
                checked={ o.selected }
                name={ action }
                onChange={() => onChange({ ...actions, [action] : { selected: !o.selected }})}
                disabled={disabled}
            />
        })}
    </>
}