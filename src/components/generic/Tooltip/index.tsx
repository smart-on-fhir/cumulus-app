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
            this.tooltip.current.firstChild!.innerHTML = el.getAttribute("data-tooltip") ?? ""

            this.positionTooltip(el)
            this.tooltip.current.style.opacity = "1"
        }, 300)
    }

    positionTooltip(el: Element) {
        const pos    = el.getAttribute("data-tooltip-position") ?? "50% 0"
        const elRect = el.getBoundingClientRect()
        const ttRect = this.tooltip.current!.getBoundingClientRect()

        let xValue = 50, yValue = 0, xUnit = "%", yUnit = "px";
        
        let [horizontal = "50%", vertical = "0"] = pos.trim().split(/\s+/);

        if (horizontal === "left"  ) {
            xValue = 0
            xUnit  = "px"
        } else if (horizontal === "center") {
            xValue = 50
            xUnit  = "%"
        } else if (horizontal === "right" ) {
            xValue = 100
            xUnit  = "%"
        } else {
            xUnit  = horizontal.endsWith("%") ? "%" : "px"
            xValue = parseFloat(horizontal)
        }

        if (vertical === "top") {
            yValue = 0
            yUnit  = "px"
        } else if (vertical === "middle") {
            yValue = 50
            yUnit  = "%"
        } else if (vertical === "bottom") {
            yValue = 100
            yUnit  = "%"
        } else {
            yUnit  = vertical.endsWith("%") ? "%" : "px"
            yValue = parseInt(vertical)
        }

        const x = xUnit === "%" ?
            Math.max(elRect.left + elRect.width / 100 * xValue - ttRect.width / 2, 2) :
            Math.max(elRect.left - ttRect.width / 2 + xValue, 2);

        let y = yUnit === "%" ?
            Math.max(elRect.top + elRect.height / 100 * yValue, 10) :
            Math.max(elRect.top + yValue, 10);

        if (y > elRect.top + elRect.height / 2) {
            this.tooltip.current!.classList.add("top-pointer")
        }
        else {
            this.tooltip.current!.classList.remove("top-pointer")
            y -= ttRect.height
        }
        
        this.tooltip.current!.classList[
            x < elRect.left - ttRect.width / 2 ||
            x > elRect.left + elRect.width - ttRect.width / 2 //||
            // y < elRect.top - ttRect.height ||
            // y > elRect.top + elRect.height - ttRect.height
            ? "add" : "remove"
        ]("no-pointer")
        
        this.tooltip.current!.style.transform = `translate(${x}px, ${y}px)`
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
        document.addEventListener("focusout", this.hideTooltip)
    }

    componentWillUnmount() {
        if (this.timer) { clearTimeout(this.timer) }
        document.documentElement.removeEventListener("mouseenter", this.onMouseEnter, { capture: true })
        document.documentElement.removeEventListener("mouseleave", this.onMouseLeave, { capture: true })
        document.removeEventListener("scroll", this.hideTooltip)
        document.removeEventListener("blur", this.hideTooltip)
        document.removeEventListener("focusout", this.hideTooltip)
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