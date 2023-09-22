import { useState } from "react"


export default function Clip({ txt = "", max = 200 }: { txt?: string, max?: number }) {
    
    const [expanded, setExpanded] = useState(false)
    
    if (txt.length <= max)  {
        return <span>{ txt }</span>
    }

    return (
        <span className="clip">
            <span>{ expanded ? txt : txt.substring(0, max) + "..." }</span>
            <b className="text-info small ml-05" style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    setExpanded(!expanded)
                }}>
                <i className="link"> { expanded ? "Show less": "Show more" }</i>
            </b>
        </span>
    )
}
