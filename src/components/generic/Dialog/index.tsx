import { MouseEvent, useLayoutEffect } from "react"
import { createPortal }                from "react-dom"
import "./Dialog.scss"


export default function Dialog({
    modal,
    open,
    body,
    header,
    footer,
    className = "",
    onClose
} : {
    modal    ?: boolean
    open     ?: boolean
    body      : JSX.Element | string
    header   ?: JSX.Element | string
    footer   ?: JSX.Element | string
    className?: string
    onClose   : (...args: any[]) => void
})
{
    const container = document.getElementById("modal")!

    useLayoutEffect(() => {
        const win = container.firstElementChild as HTMLDivElement
        
        if (win) {
            win.style.transform = `translate(${
                window.innerWidth / 2 - win.offsetWidth / 2
            }px, ${
                window.innerHeight / 2 - win.offsetHeight / 2
            }px)`
        }
    }, [open])

    if (!open) {
        return createPortal(null, container)
    }

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

    return createPortal(
        <>
            <div className={ className + " dialog" }>
                { !!header && <div className="dialog-header" onMouseDown={dragStart}>
                    <div>{ header }</div>
                    <i className="fa-solid fa-circle-xmark close-dialog" title="Close" onMouseDown={() => onClose()} />
                </div> }
                <div className="dialog-body">{ body }</div>
                { !!footer && <div className="dialog-footer">{ footer }</div> }
            </div>
            <div className={ "dialog-overlay" + (modal ? " modal" : "") } onMouseDown={e => {
                e.preventDefault()
                e.stopPropagation()
                if (!modal) {
                    onClose()
                }
            }} onContextMenu={e => e.preventDefault()} />
        </>,
        container
    )
}
