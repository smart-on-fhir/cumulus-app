import { Fragment, useState }  from "react"
import LengthEditor  from "./LengthEditor"
import NumberEditor  from "./NumberEditor"
import StringEditor  from "./StringEditor"
import ColorEditor   from "./ColorEditor"
import BooleanEditor from "./BooleanEditor"
import OptionsEditor from "./OptionsEditor"
import ShadowEditor  from "./ShadowEditor"
import {
    EditableGroupProperty,
    EditableNumberProperty,
    EditableProperty
} from "./types"
import "./PropertyGrid.scss"



function PropertyEditor({ prop }: { prop: EditableProperty }): JSX.Element {
    switch (prop.type) {
        case "boolean":
            return <BooleanEditor prop={ prop } />
        case "number":
            return <NumberEditor prop={ prop as EditableNumberProperty } />
        case "length":
            return <LengthEditor prop={ prop } />
        case "color":
            return <ColorEditor prop={ prop } />
        case "options":
            return <OptionsEditor prop={ prop } />
        case "shadow":
            return <ShadowEditor onChange={ prop.onChange } props={ prop.value} />
        default:
            return <StringEditor prop={ prop } />
    }
}

export default function PropertyGrid({
    props,
    level = 0
}: {
    props: (EditableProperty | EditableGroupProperty)[]
    level?: number
}) {
    return (
        <div className="property-grid">
            { propertyGridRows(props, level) }
        </div>
    )
}

export function PropertyEditorGroup({
    props,
    name
}: {
    props: EditableProperty[]
    name: string
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="property-grid">
            <b
                className={ "prop-label group-heading" + (open ? " open" : "") }
                onClick={() => setOpen(!open)}
                onKeyDown={e => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setOpen(!open)
                    }
                }}
                title={ "Click to " + (open ? "collapse" : "expand") }
                tabIndex={0}
            >
                <i className={ "fa-solid " + (open ? "fa-caret-down" : "fa-caret-right") } />
                { name }
            </b>
            { open ? <>
                { props.map((prop, i) => {
                    return <Fragment key={i + "xx"}>
                        <div className="prop-label" title={ prop.description } style={{ paddingLeft: "1.3em" }}>{ prop.name }</div>
                        <div className="prop-editor"><PropertyEditor prop={prop as EditableProperty} /></div>
                    </Fragment>
                }) }
            </> : null }
        </div>
    )
}

function propertyGridRows(props: (EditableProperty | EditableGroupProperty)[], level = 0): JSX.Element[] {
    return props.map((prop, i) => {

        if (prop.type === "group") {
            return (<PropertyEditorGroup props={ prop.value } key={ i } name={ prop.name } />)
        }

        prop = prop as EditableProperty

        if (prop.type === "shadow") {
            return <ShadowEditor
                onChange={ prop.onChange }
                props={ prop.value }
                key={ i }
                name={ prop.name }
                description={ prop.description }
            />
        }

        return (
            <Fragment key={ i }>
                <div className={ "prop-label" + (prop.disabled ? " disabled" : "") } style={{ paddingLeft: level ? level + "em" : 4 }}>
                    <span>
                        { prop.name } { prop.description && <small className="color-muted" title={ prop.description }><i className="fa-solid fa-circle-info"></i></small> }
                    </span>
                </div>
                <div className="prop-editor"><PropertyEditor prop={prop as EditableProperty} /></div>
            </Fragment>
        )
    });
}
