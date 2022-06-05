import { Component, createRef } from "react"
import ContentEditable from "react-contenteditable"


interface CaptionEditorProps {
    html: string | null
    disabled?: boolean
    onChange: (html: string) => void
}

interface CaptionEditorState {
    html: string
}

export default class CaptionEditor extends Component<CaptionEditorProps, CaptionEditorState> {
    
    contentEditable: React.RefObject<HTMLDivElement>;

    constructor(props: CaptionEditorProps) {
        super(props);
        this.contentEditable = createRef();
        this.state = { html: String(props.html || "").trim() };
    };
  
    handleChange = (evt: any) => {
        const { onChange } = this.props
        this.setState({ html: evt.target.value });
        onChange && onChange(evt.target.value)
    };
  
    render() {
        return <ContentEditable
            innerRef={this.contentEditable}
            html={this.state.html}
            disabled={!!this.props.disabled}
            onChange={this.handleChange}
            className="chart-caption"
            tagName='div'
        />
    }
}