import ContentEditable from "react-contenteditable"
import { stripTags }   from "../../utils"


interface CaptionEditorProps {
    html: string | null
    disabled?: boolean
    onChange: (html: string) => void
}

export default function CaptionEditor({ html, disabled, onChange }: CaptionEditorProps) {
    return <ContentEditable
        html={ stripTags(html || "") ? html || "" : "" }
        disabled={ !!disabled }
        onChange={ e => onChange(e.target.value) }
        className="chart-caption"
        tagName="div"
    />
}
