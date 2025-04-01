import { ReactNode } from "react";
import { classList } from "../../../utils";
import MenuButton from "../MenuButton";


export default function Panel({
    title,
    menu,
    loading,
    children,
    icon
}: {
    title: string
    menu?: (ReactNode|"separator"|null)[]
    icon?: ReactNode | null
    loading?: boolean
    children?: ReactNode | string | (ReactNode | string)[]
})
{
    return (
        <>
            <div className="row gap baseline">
                <div className="col">
                    <h4>{ icon } { title }</h4>
                </div>
                { menu && <div className="col col-0">
                    <MenuButton right items={menu}>
                        <i className={ classList({
                            "fa-solid fa-rotate fa-spin grey-out": !!loading,
                            "fa-solid fa-ellipsis-vertical default-icon": !loading
                        })} />
                    </MenuButton>
                </div> }
            </div>
            <hr className="mb-1"/>
            <div>
                { children }
            </div>
        </>
    )
}
