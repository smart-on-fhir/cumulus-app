import { Component } from "react"
import { classList } from "../../utils";
import "./MenuButton.scss"


interface MenuButtonProps {
    items: (JSX.Element|"separator"|null)[]
    right?: boolean
    title?: string
    children?: JSX.Element | string | (JSX.Element | string)[]
}

export default class MenuButton extends Component<MenuButtonProps>
{
    onMenuClick(e: any)
    {
        e.target.blur()
    }

    render()
    {
        const { items, right, title = "Menu", children = null } = this.props;

        return (
            <span className={ classList({ "menu-button": true, "menu-right": !!right }) }>
                <button title={title} type="button">
                    { children || <i className="fa-solid fa-ellipsis-vertical default-icon"/> }
                </button>
                <div className="menu" onClick={this.onMenuClick}>
                    { items.filter(Boolean).map((item, i) => {
                        if (item === "separator") {
                            return <hr key={i} />
                        }
                        return <div key={i} className="menu-item">{ item }</div>
                    }) }
                </div>
            </span>
        )
    }
}
