import { ReactNode, useEffect, useRef, useState }  from "react"
import "./Collapse.scss"


export default function Collapse({ header, children, collapsed }: {
    header: ReactNode,
    children: ReactNode,
    collapsed?: boolean
}) {
    const [isCollapsed, setCollapsed] = useState(!!collapsed)

    const refBody = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (refBody.current) {
            if (isCollapsed) {
                refBody.current.style.height = "0"
            }
            else {
                refBody.current.style.height = refBody.current.scrollHeight + "px";
            }
        }
    }, [isCollapsed, refBody])

    
    const onTransitionEnd = () => {
        if (refBody.current) {
            refBody.current.classList.remove("animating")
            refBody.current.style.height = isCollapsed ? "0" : "auto"
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
        <div className={"collapse" + (isCollapsed ? " collapsed" : "")}>
            <div className="collapse-header" onClick={toggle}>
                <i className={ "fa-solid fa-caret-" + (isCollapsed ? "right" : "down") }/> {header}
            </div>
            <div className="collapse-body" ref={refBody} onTransitionEnd={onTransitionEnd}>{children}</div>
        </div>
    )
}