import { Component, createRef, MouseEvent } from "react"
import { classList } from "../../utils";
import "./DataGrid.scss"


interface Column {
    name    : string
    label  ?: string
    dataType: "boolean" | "float" | "integer" | "string" | "date:YYYY-MM-DD" | "date:YYYY-MM" | "date:YYYY"
}

interface DataGridProps {
    cols    : Column[]
    rows    : any[][] | Record<string, any>[]
    sortDir?: "asc" | "desc"
    sortBy? : string | null
    offset? : number
    limit?  : number
}

interface DataGridState {
    sortDir: "asc"  | "desc"
    sortBy : string | null
    offset : number
    limit  : number
    selection: {
        rowIndex: number
        colIndex: number
    }
}

export default class DataGrid extends Component<DataGridProps, DataGridState>
{
    private gridWrapper = createRef<HTMLDivElement>();

    constructor(props: DataGridProps)
    {
        super(props)

        this.state = {
            sortDir: props.sortDir || "asc",
            sortBy : props.sortBy  || null,
            offset : props.offset  || 0,
            limit  : props.limit   || 0,
            selection: {
                rowIndex: -1,
                colIndex: -1
            }
        };

        this.onWheel = this.onWheel.bind(this)
        this.onClick = this.onClick.bind(this)
        this.onTouchStart = this.onTouchStart.bind(this)
    }

    onTouchStart(e: TouchEvent) {
        
        if (e.touches.length < 2) return;
        
        let { screenX, screenY } = e.touches.item(0) as Touch

        e.preventDefault()
        
        const onTouchMove = (e2: TouchEvent) => {
            const t = e2.touches.item(0) as Touch
            const x = t.screenX || screenX
            const y = t.screenY || screenY
            const deltaX = screenX - x
            const deltaY = screenY - y
            
            screenX = x
            screenY = y

            this.onWheel({
                deltaX,
                deltaY,
                preventDefault() {
                    e2.preventDefault()
                }
            } as WheelEvent)
        };

        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", function() {
            this.removeEventListener("touchmove", onTouchMove);
        }, { once: true });
    }


    onWheel(e: WheelEvent)
    {
        // Exit if this seems to be a horizontal scroll
        if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
            return true
        }
        
        const currentOffset = this.state.offset;

        // Exit if we have already scrolled to the top
        if (e.deltaY < 0 && currentOffset === 0) {
            return true;
        }
        
        // Exit if we have already scrolled to the bottom
        if (e.deltaY > 0 && currentOffset >= this.props.rows.length - (this.props.limit || 0)) {
            return true;
        }

        // Do not scroll the page if we got to here
        e.preventDefault()
        
        if (e.deltaY > 1) {
            this.setState({
                offset: Math.min(
                    this.state.offset + Math.ceil(e.deltaY/50),
                    this.props.rows.length - (this.props.limit || 0)
                )
            })
        } else {
            this.setState({
                offset: Math.max(
                    this.state.offset + Math.floor(e.deltaY/50),
                    0
                )
            })
        }
    }

    onClick(e: MouseEvent<HTMLElement>)
    {
        let td = e.target as any;
        
        while (td && td.nodeName && td.nodeName !== "TD") {
            td = td.parentElement
        }

        if (td) {
            let colIndex = 0, cur: any = td
            while (cur.previousElementSibling && cur.previousElementSibling.nodeName === "TD") {
                cur = cur.previousElementSibling
                colIndex += 1
            }

            this.setState({
                selection: {
                    colIndex,
                    rowIndex: +td.parentElement.getAttribute("data-row-id") // rowIndex + this.state.offset
                }
            })
        }
    }

    componentDidMount()
    {
        if (this.gridWrapper.current) {
            this.gridWrapper.current.addEventListener("wheel", this.onWheel, { passive: false });
            this.gridWrapper.current.addEventListener("touchstart", this.onTouchStart);

            this.gridWrapper.current.querySelectorAll("th").forEach(th => {
                th.style.minWidth = th.offsetWidth + 5 + "px"
                th.style.maxWidth = th.offsetWidth + 5 + "px"
            })
        }
    }

    componentWillUnmount()
    {
        if (this.gridWrapper.current) {
            this.gridWrapper.current.removeEventListener("wheel", this.onWheel);
            this.gridWrapper.current.removeEventListener("touchstart", this.onTouchStart);
        }
    }

    sort()
    {
        const { cols, rows } = this.props;
        const { sortBy, sortDir } = this.state;

        const out = rows.map((row, i) => {
            let out = row
    
            if (!Array.isArray(row)) {
                out = cols.map(c => row[c.name])
            }
    
            Object.defineProperty(out, "__row_id__", {
                configurable: false,
                writable    : false,
                enumerable  : false,
                // @ts-ignore
                value       : row.__row_id__
            })
    
            return out as any[][]
        });
    
        if (!sortBy) {
            return out
        }
    
        const index = cols.findIndex(col => col.name === sortBy)
        const type  = cols.find(col => col.name === sortBy)?.dataType
    
        return out.sort(
            (a: any, b: any) => {
                
                if (type === "integer" || type === "float")
                    return (
                        b[index] === null ? -1 : a[index] === null ? 1 :
                        b[index] - a[index]
                    ) * (sortDir === "asc" ? 1 : -1)
                return String(b[index] || "").localeCompare(String(a[index] || "")) * (sortDir === "asc" ? 1 : -1)
            }
        )
    }

    render()
    {
        const { cols, rows } = this.props;

        const { sortBy, sortDir, limit, selection: { rowIndex } } = this.state;
        
        let _rows = this.sort()
        
        let offset = Math.max(Math.min(this.state.offset, _rows.length - limit), 0)
        
        _rows = _rows.slice(offset, limit ? offset + limit : undefined);

        return (
            <div className="data-grid-wrap">
                <div className="data-grid" ref={ this.gridWrapper }>
                    <table>
                        <colgroup>
                            { cols.map((col, i) => (
                                <col key={i} className={ col.name === "cnt" || col.name === "queryid" ? "private" : undefined } />
                            )) }
                        </colgroup>
                        <thead>
                            <tr>
                                { cols.map((col, i) => (
                                    <th key={i} style={{ cursor: "pointer" }} onMouseDown={e => {
                                        e.preventDefault();
                                        if (sortBy === col.name) {
                                            if (sortDir === "asc") {
                                                this.setState({ sortDir: "desc" })
                                            }
                                            else if (sortDir === "desc") {
                                                this.setState({ sortBy: null })
                                            }
                                            else {
                                                this.setState({ sortDir: "asc" })
                                            }
                                        }
                                        else {
                                            this.setState({ sortDir: "asc", sortBy: col.name })
                                        }
                                    }}>
                                        {col.label || col.name}&nbsp;
                                        { sortBy === col.name && sortDir === "asc" && <i className="fas fa-caret-up color-grey-dark"/> }
                                        { sortBy === col.name && sortDir === "desc" && <i className="fas fa-caret-down color-grey-dark"/> }
                                    </th>
                                )) }
                            </tr>
                        </thead>
                        <tbody onClick={this.onClick}>
                            { _rows.map((row, y) => (
                                // @ts-ignore
                                <tr
                                    key={y}

                                    // @ts-ignore
                                    className={ classList({ selected: row.__row_id__ === rowIndex })}
                                    
                                    // @ts-ignore
                                    data-row-id={ row.__row_id__ + "" }
                                >
                                    {
                                        row.map((value, i) => {
                                            if (value === null) {
                                                return <td key={i}><span className="color-muted">null</span></td>
                                            }
                                            switch (cols[i].dataType) {
                                                case "boolean":
                                                    return <td key={i}>{ value ? <span className="boolean-true">true</span> : <span className="boolean-false">false</span> }</td>
                                                case "float":
                                                    return <td key={i}><span className="float">{ +value }</span></td>
                                                case "integer":
                                                    return <td key={i} className="color-red">{ +value }</td>
                                                case "string":
                                                    return <td key={i}><span className="string">{ value }</span></td>
                                                default:
                                                    return <td key={i}>{ value }</td>
                                            }
                                        })
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Scrollbar
                    total={ rows.length }
                    offset={ offset }
                    limit={ limit }
                    onChange={ offset => this.setState({ offset }) }
                />
            </div>
        )
    }
} 

function Scrollbar({
    total,
    offset,
    limit,
    onChange
}: {
    total: number
    offset: number
    limit: number
    onChange: (offset: number) => void
})
{

    function onBtnDown(e: MouseEvent<HTMLDivElement>)
    {
        e.preventDefault();

        const rect    = e.currentTarget.parentElement?.getBoundingClientRect() as DOMRect
        const btnRect = e.currentTarget.getBoundingClientRect();
        const diffY   = e.clientY - btnRect.y

        function onMouseMove(ev: any) {
            const q = Math.min(Math.max(((ev.clientY - diffY - rect.top) / rect.height), 0), 1)
            const newOffset = Math.min(Math.floor(total * q), total - limit)
            onChange(newOffset)
        }

        window.addEventListener("mousemove", onMouseMove)

        window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", onMouseMove)
        }, { once: true })
    }

    const pageSize = Math.min(total - offset, limit)
    
    let btnSize = pageSize < limit ? 100 : limit / (total || 1) * 100;
    let btnStart = offset + limit > total ? 0 : (offset / (total || 1) * 100);
    
    return (
        <div className="scrollbar">
            <div className="scrollbar-btn" style={
                {
                    top    : btnStart + "%",
                    height : btnSize + "%",
                    display: btnSize >= 100 ? "none" : "block"
                }
            } onMouseDown={onBtnDown} />
        </div>
    )
}
