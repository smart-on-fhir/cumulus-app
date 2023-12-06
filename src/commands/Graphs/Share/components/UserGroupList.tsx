import Checkbox from "../../../../components/generic/Checkbox";


interface SelectableGroup {
    selected: boolean;
    name: string;
    id: number;
    description: string;
}

export default function UserGroupList({
    groups,
    onChange
}: {
    groups : SelectableGroup[]
    onChange: (groups: SelectableGroup[]) => void
})
{
    return <>
        { groups.map(g => {
            return <Checkbox
                key={g.id}
                checked={ g.selected }
                name={ g.name }
                description={ g.description }
                onChange={() => {
                    const next = [...groups]
                    const item = next.find(o => g.id === o.id)!
                    item.selected = !item.selected
                    onChange(next)
                }}
            />
        })}
    </>
}