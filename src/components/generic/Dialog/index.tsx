import { CSSProperties, MouseEvent, ReactNode, useEffect } from "react"
import { modalRoot }     from "../../../roots"
import { centerElement } from "../../../utils"
import "./Dialog.scss"


export default function Dialog({
    modal,
    body,
    header,
    footer,
    className = "",
    style,
    onComplete
} : {
    modal      ?: boolean
    header     ?: ReactNode
    className  ?: string
    body        : (props: { close: () => void, center: () => void }) => ReactNode
    footer     ?: (props: { close: () => void, center: () => void }) => ReactNode
    style      ?: CSSProperties
    onComplete ?: () => void
})
{
    const container = document.getElementById("modal")!

    function close() {
        modalRoot.render(<>{}</>)
        onComplete && onComplete()
    }

    function center() {
        centerElement(document.getElementById("modal")?.firstElementChild as HTMLDivElement)
    }

    useEffect(() => center(), [])

    function dragStart(e: MouseEvent) {

        // only use the left button
        if (e.button !== 0) {
            return true
        }

        e.preventDefault()

        container.classList.add("dragging")

        const win       = container.firstElementChild as HTMLDivElement        
        const rect      = win.getBoundingClientRect()
        const winWidth  = window.innerWidth
        const winHeight = window.innerHeight

        const start = { x: e.clientX - rect.left, y: e.clientY - rect.top }

        function onMouseMove(e: any) {
            const x = Math.max(Math.min(e.clientX - start.x, winWidth  - 40), - rect.width + 40)
            const y = Math.max(Math.min(e.clientY - start.y, winHeight - 34), 3)
            win.style.transform = `translate(${x}px, ${y}px)`
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", () => {
            container.classList.remove("dragging")
            window.removeEventListener("mousemove", onMouseMove)
        }, { once: true })
    }

    return (
        <>
            <div className={ className + " dialog" } style={style}>
                { !!header && <div className="dialog-header" onMouseDown={dragStart}>
                    <div>{ header }</div>
                    <i className="fa-solid fa-circle-xmark close-dialog" title="Close" onMouseDown={() => close()} />
                </div> }
                <div className="dialog-body">{ body({ close, center }) }</div>
                { !!footer && <div className="dialog-footer">{ footer({ close, center }) }</div> }
            </div>
            <div className={ "dialog-overlay" + (modal ? " modal" : "") } onMouseDown={e => {
                e.preventDefault()
                e.stopPropagation()
                if (!modal) {
                    close()
                }
            }} onContextMenu={e => e.preventDefault()} />
        </>
    )
}
