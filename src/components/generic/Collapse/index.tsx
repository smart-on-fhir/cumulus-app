import { ReactNode, useEffect, useRef, useState }  from "react"
import "./Collapse.scss"


export default function Collapse({ header, children, collapsed, className = "" }: {
    header: ReactNode,
    children: ReactNode ,
    collapsed?: boolean,
    className?: string
}) {
    const [isCollapsed, setCollapsed] = useState(!!collapsed)

    const refBody = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (refBody.current) {
            refBody.current.style.height = refBody.current.scrollHeight + "px";
            if (isCollapsed) {
                refBody.current.style.height = "0"
            }
        }
    }, [isCollapsed, refBody])

    
    const onTransitionEnd = () => {
        if (refBody.current) {
            refBody.current.style.height = isCollapsed ? "0" : "auto"
            refBody.current.classList.remove("animating")
        }
    }
    
    const onTransitionStart = () => {
        if (refBody.current) {
            refBody.current.classList.add("animating")
            refBody.current.style.height = refBody.current.scrollHeight + "px";
        }
    }
    
    const toggle = () => {
        onTransitionStart()
        setCollapsed(!isCollapsed)
    }
    
    // eslint-disable-next-line
    useEffect(() => onTransitionEnd(), []);

    return (
        <div className={"collapse " + className + (isCollapsed ? " collapsed" : "")}>
            <div className="collapse-header" onClick={toggle} tabIndex={0}
                onKeyDown={e => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggle()
                    }
                }}>
                <i className={ "fa-solid fa-caret-" + (isCollapsed ? "right" : "down") }/> {header}
            </div>
            <div className="collapse-body" ref={refBody} onTransitionEnd={onTransitionEnd}>{children}</div>
        </div>
    )
}