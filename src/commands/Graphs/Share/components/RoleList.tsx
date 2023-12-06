import Checkbox from "../../../../components/generic/Checkbox"


export default function RoleList({
    roles,
    onChange
}: {
    roles : Record<string, boolean>
    onChange: (list: typeof roles) => void
})
{
    return <>
        { Object.keys(roles).map(key => {
            const o = roles[key];
            return <Checkbox
                key={key}
                checked={ o }
                name={ key }
                onChange={() => onChange({ ...roles, [key] : !o })}
            />
        })}
    </>
}