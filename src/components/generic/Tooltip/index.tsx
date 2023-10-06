import { Component, createRef, RefObject } from "react"
import { createPortal } from "react-dom";
import "./Tooltip.scss"


export default class Tooltip extends Component<any> {

    tooltip: RefObject<HTMLDivElement>;

    timer: NodeJS.Timeout | null = null

    constructor(props: any) {
        super(props);
        this.tooltip = createRef<HTMLDivElement>();
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.hideTooltip  = this.hideTooltip.bind(this);
    }

    showTooltip(el: Element) {
        if (!this.tooltip.current) {
            return
        }

        if (this.timer) {
            clearTimeout(this.timer)
        }
        
        this.timer = setTimeout(() => {
            if (!this.tooltip.current) {
                return
            }

            // @ts-ignore
            this.tooltip.current.firstChild!.innerText = el.getAttribute("data-tooltip") ?? ""
                
            const elRect = el.getBoundingClientRect()
            const ttRect = this.tooltip.current.getBoundingClientRect()
            const x = Math.max(elRect.left + elRect.width / 2 - ttRect.width / 2, 2)
            const y = Math.max(elRect.top - ttRect.height, 10)
            this.tooltip.current.style.transform = `translate(${x}px, ${y}px)`
            this.tooltip.current.style.opacity = "1"
        }, 300)
    }
    
    hideTooltip() {
        if (this.timer) {
            clearTimeout(this.timer)
        }
        if (this.tooltip.current) {
            this.tooltip.current.style.opacity = "0"
        }
    }

    onMouseLeave(e: MouseEvent) {
        let el: any = e.target
        if (!el || el.nodeType !== 1 || !el.getAttribute("data-tooltip")) {
            return true
        }
        this.hideTooltip()
    }

    onMouseEnter(e: MouseEvent) {
        let el: any = e.target
        if (!el || el.nodeType !== 1 || !el.getAttribute("data-tooltip")) {
            return true
        }
        this.showTooltip(el as Element)
    }

    componentDidMount() {
        document.documentElement.addEventListener("mouseenter", this.onMouseEnter, { capture: true })
        document.documentElement.addEventListener("mouseleave", this.onMouseLeave, { capture: true })
        document.addEventListener("scroll", this.hideTooltip, { passive: true })
        document.addEventListener("blur", this.hideTooltip)
    }

    componentWillUnmount() {
        if (this.timer) { clearTimeout(this.timer) }
        document.documentElement.removeEventListener("mouseenter", this.onMouseEnter, { capture: true })
        document.documentElement.removeEventListener("mouseleave", this.onMouseLeave, { capture: true })
        document.removeEventListener("scroll", this.hideTooltip)
        document.removeEventListener("blur", this.hideTooltip)
    }

    shouldComponentUpdate() {
        return false
    }

    render() {
        return createPortal(
            <div className="tooltip" ref={ this.tooltip }>
                <div className="contents"/>
                <div className="pointer"/>
            </div>,
            document.getElementById("tooltip-container")!
        )
    }
}