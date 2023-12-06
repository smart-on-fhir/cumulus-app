import Checkbox from "../../../../components/generic/Checkbox"
import { app }  from "../../../../types"


export default function ActionsList({
    actions,
    onChange,
    resource,
    user
}: {
    actions : Record<string, { selected: boolean }>
    onChange: (actions: Record<string, { selected: boolean }>) => void
    resource: string
    user    : app.User
})
{
    return <>
        { Object.keys(actions).map(key => {
            const o = actions[key];
            return <Checkbox
                key={key}
                checked={ o.selected }
                name={ key }
                onChange={() => onChange({ ...actions, [key] : { selected: !o.selected }})}
                disabled={ !user.permissions.includes(resource + "." + key) }
            />
        })}
    </>
}