import React from "react";
import { render } from "react-dom"
import { classList } from "../../../utils";
import "./Menu.scss"

export interface MenuItemConfig {
    label: string | JSX.Element
    command?: (e: MouseEvent) => void
    enabled?: boolean | ((e: MouseEvent) => boolean)
    active?: boolean | ((e: MouseEvent) => boolean)
    available?: boolean | ((e: MouseEvent) => boolean)
    icon?: JSX.Element
    children?: MenuItemConfig[]
}

export class ContextMenu extends React.Component
{
    hideMenu() {
        const menu = document.querySelector<HTMLDivElement>("#context-menu > .menu");
        if (menu) {
            menu.blur()
            document.getElementById("context-menu")?.classList.remove("open");
        }
    }

    positionMenu() {
        const menu = document.querySelector<HTMLDivElement>("#context-menu > .menu");
        if (menu) {
            document.getElementById("context-menu")?.classList.add("open");
            menu.style.marginTop = "0"
            menu.style.marginLeft = "0"
            menu.style.display = "block"
            menu.style.opacity = "0"
            menu.focus()
            requestAnimationFrame(() => {
                const menuRect = menu.getBoundingClientRect()

                if (menuRect.top + menuRect.height > window.innerHeight) {
                    menu.style.marginTop = -menuRect.height + "px"
                }

                if (menuRect.left + menuRect.width > window.innerWidth) {
                    menu.style.marginLeft = -menuRect.width + "px"
                }

                menu.style.removeProperty("display")
                menu.style.removeProperty("opacity")
            })
        }
    }

    renderMenu(e: MouseEvent, menuItems: (MenuItemConfig | "-")[]) {

        const access = (obj: Record<string, any>, prop: keyof typeof obj, ...args: any[]) => {
            const val = obj[prop];
            if (typeof val === "function") {
                return val(...args)
            }
            return val
        };

        return (
            <div
                className="menu"
                tabIndex={-1}
                style={{
                    left: e.clientX,
                    top : e.clientY,
                }}
                onContextMenu={ e => e.preventDefault() }
            >
                { menuItems.map((item, i) => {
                    
                    if (item === "-") {
                        return <hr key={i} />
                    }

                    if (access(item, "available", e) === false) {
                        return null
                    }

                    if (!item.command) {
                        return <div className="menu-header" key={i}>
                            <span className="menu-item-icon">{ item.icon || "" }</span>
                            { item.label }
                        </div>
                    }


                    const enabled = access(item, "enabled", e);
                    const active  = access(item, "active" , e);

                    return <div className={ classList({
                        "menu-item": true,
                        disabled: enabled === false,
                        selected: active === true
                    })} key={i} onMouseDown={(ev) => {
                        if (enabled !== false) {
                            ev.stopPropagation()
                            this.hideMenu()
                            setTimeout(() => item.command!(e), 10)
                        }
                    }}>
                        <span className="menu-item-icon">{ item.icon || "" }</span>
                        { item.label }
                        { item.children && this.renderMenu(e, item.children) }
                    </div>
                })}
            </div>
        )
    }

    componentDidMount() {

        document.addEventListener("mousedown", this.hideMenu)

        document.addEventListener("contextmenu", e => {
            // @ts-ignore
            const menuItems: (MenuItemConfig | "-")[] = e.menuItems;

            if (!Array.isArray(menuItems) || !menuItems.length) {
                return true
            }

            e.preventDefault()

            render(
                this.renderMenu(e, menuItems),
                document.getElementById("context-menu")!
            )

            this.positionMenu()
        }, { capture: false })
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return null
    }
}
