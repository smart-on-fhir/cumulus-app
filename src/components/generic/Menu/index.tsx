import React, { ReactNode } from "react"
import { classList }        from "../../../utils"
import { Command }          from "../../../commands/Command"
import { contextMenuRoot }  from "../../.."
import "./Menu.scss"


export interface MenuItemConfig {
    label        : ReactNode
    execute     ?: (e: MouseEvent) => void
    enabled     ?: boolean | ((e: MouseEvent) => boolean)
    active      ?: boolean | ((e: MouseEvent) => boolean)
    available   ?: boolean | ((e: MouseEvent) => boolean)
    icon        ?: ReactNode
    children    ?: MenuItemConfig[]
    description ?: string
}

export class ContextMenu extends React.Component
{
    target: any = null

    constructor(props: any) {
        super(props)
        this.hideMenu = this.hideMenu.bind(this)
    }

    hideMenu() {
        if (this.target) {
            this.target.classList?.remove("focus")
            this.target = null
        }

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
            menu.addEventListener("blur", this.hideMenu, { once: true })
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

    renderMenu(e: MouseEvent, menuItems: (MenuItemConfig | Command | "-")[]) {

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
                tabIndex={0}
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

                    if (!item.execute) {
                        return <div className="menu-header" key={i} title={access(item, "description")}>
                            <span className="menu-item-icon">{ item.icon as any }</span>
                            { item.label as any }
                        </div>
                    }


                    const enabled = access(item, "enabled", e);
                    const active  = access(item, "active" , e);

                    return <div className={ classList({
                        "menu-item": true,
                        disabled: enabled === false,
                        selected: active === true
                    })} key={i} title={access(item, "description")} onMouseDown={(ev) => {
                        if (enabled !== false) {
                            ev.stopPropagation()
                            this.hideMenu()
                            setTimeout(() => item.execute!(e))
                        }
                    }}>
                        <span className="menu-item-icon">{ item.icon as any }</span>
                        { item.label as any }
                        {
                            // @ts-ignore
                            item.children && this.renderMenu(e, item.children)
                        }
                    </div>
                })}
            </div>
        )
    }

    componentDidMount() {

        document.removeEventListener("mousedown", this.hideMenu, { capture: true })
        document.addEventListener("mousedown", this.hideMenu, { capture: true })

        document.addEventListener("contextmenu", e => {
            // @ts-ignore
            const menuItems: (MenuItemConfig | "-")[] = e.menuItems;

            if (!Array.isArray(menuItems) || !menuItems.length) {
                return true
            }

            e.preventDefault()

            if (this.target) this.target.classList?.remove("focus")

            // @ts-ignore
            this.target = e.customTarget || null

            if (this.target) this.target.classList?.add("focus")

            contextMenuRoot.render(this.renderMenu(e, menuItems))

            requestAnimationFrame(() => this.positionMenu())
        }, { capture: false })
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return null
    }
}
