import { ReactNode, TransitionEvent, useEffect, useRef, useState }  from "react"
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
            // refBody.current.style.height = "auto";
            if (isCollapsed) {
                refBody.current.style.height = refBody.current.scrollHeight + "px";
                requestAnimationFrame(() => { if (refBody.current) refBody.current.style.height = "2px" })
            }
            else {
                refBody.current.style.height = refBody.current.scrollHeight + "px";
            }
        }
    }, [isCollapsed, refBody])

    const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
        if (refBody.current) {
            refBody.current.style.height = isCollapsed ? "2px" : "auto"
            refBody.current.classList.remove("animating")
        }
    }

    const onTransitionStart = () => {
        if (refBody.current) {
            refBody.current.classList.add("animating")
            setCollapsed(!isCollapsed)
        }
    }

    return (
        <div className={"collapse" + (isCollapsed ? " collapsed" : "")}>
            <div className="collapse-header" onClick={onTransitionStart}>
                <i className={ "fa-solid fa-caret-" + (isCollapsed ? "right" : "down") }/> {header}
            </div>
            <div className="collapse-body" ref={refBody} onTransitionEnd={onTransitionEnd}>{children}</div>
        </div>
    )
}