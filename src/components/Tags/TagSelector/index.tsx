import { classList }       from "../../../utils"
import Checkbox            from "../../generic/Checkbox"
import EndpointListWrapper from "../../generic/EndpointListWrapper"
import Tag                 from "../Tag"
import "../../generic/Select/Select.scss"
import "./TagSelector.scss"


type PartialTag = Pick<app.Tag, "id" | "name" | "description">

export default function TagSelector({
    selected = [],
    onChange
}: {
    selected?: PartialTag[]
    onChange: (selection: PartialTag[]) => void
})
{
    function createOnChangeHandler(tag: PartialTag) {
        return () => {
            const index = selected.findIndex(t => t.id === tag.id)
            if (index > -1) {
                const nextValue = [ ...selected ]
                nextValue.splice(index, 1)
                onChange(nextValue)
            } else {
                onChange([ ...selected, tag ])
            }
        }
    }

    const len = selected.length
    const value = len ?
        <>{ selected.map((t, i) => <Tag tag={t} key={i} /> )}</> :
        "No tags selected"

    return (
        <div className="form-control select-component tag-selector" tabIndex={0}>
            <div className={ classList({
                "select-component-value": true,
                "color-muted": len === 0
            })}
            >{ value }</div>
            <div className="select-component-menu">
                <EndpointListWrapper endpoint="/api/tags">
                    {(data: PartialTag[]) => (
                        <>
                        { data.map((tag, i) => (
                            <Checkbox
                                key={i}
                                checked={!!selected.find(t => t.id === tag.id)}
                                className="tag-item"
                                name={tag.id + ""}
                                onChange={createOnChangeHandler(tag)}
                                label={tag.name}
                                description={tag.description}
                            />
                        ))}
                        </>
                    )}
                </EndpointListWrapper>
            </div>
        </div>
    )
}