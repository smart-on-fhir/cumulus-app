import { Component, createRef, ReactNode, RefObject } from "react"
import { classList } from "../../../utils";
import "./MenuButton.scss"


interface MenuButtonProps {
    items: (ReactNode|"separator"|null)[] | ReactNode
    right?: boolean
    title?: string
    children?: ReactNode
}

export default class MenuButton extends Component<MenuButtonProps>
{
    wrapper: RefObject<HTMLSpanElement>;

    constructor(props: MenuButtonProps) {
        super(props)
        this.wrapper = createRef()
    }

    onMenuClick(e: any)
    {
        e.target.blur()
    }

    render()
    {
        const { items, right, title = "Menu", children = null } = this.props;

        return (
            <span
                className={ classList({ "menu-button": true, "menu-right": !!right }) }
                tabIndex={0}
                ref={ this.wrapper }
                onClick={e => {
                    if (this.wrapper && this.wrapper.current && e.target !== this.wrapper.current) {
                        this.wrapper.current.blur()
                    }
                }}
            >
                <div title={title} className="menu-button-btn">
                    { children || <i className="fa-solid fa-ellipsis-vertical default-icon"/> }
                </div>
                <div className="menu" onClick={this.onMenuClick}>
                    { Array.isArray(items) ? items.filter(Boolean).map((item, i) => {
                        if (item === "separator") {
                            return <hr key={i} />
                        }
                        return <div key={i} className="menu-item">{ item }</div>
                    }) : items }
                </div>
            </span>
        )
    }
}
