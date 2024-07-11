import Markdown from "../Markdown";
import { useState } from "react";
import "./MarkdownEditor.scss";


export default function MarkdownEditor({
    textarea,
    height
}: {
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
    height?: string | number
}) {

    const [viewType, setViewType] = useState<"markdown" | "preview">("markdown") 

    return (
        <div className="markdown-editor">
            <div className="row row-0 gap bottom" style={{ marginBottom: "0.25rem" }}>
                <div className="col col-0">
                    <label className="p-0" htmlFor="description">Description</label>
                </div>
                <div className="col col-auto right">
                    <div className="toolbar flex">
                        <button
                            className={"btn" + (viewType === "markdown" ? " active" : "")}
                            onClick={() => setViewType("markdown")}
                            type="button"
                            title="Edit"
                        ><i className="fa-solid fa-code"/> Markdown
                        </button>
                        <button
                            className={"btn" + (viewType === "preview" ? " active" : "")}
                            onClick={() => setViewType("preview")}
                            type="button"
                            title="Preview"
                        ><i className="fa-solid fa-eye"/> Preview
                        </button>
                    </div>
                </div>
            </div>
            <div className="row row-10">
                <div className="col">
                { viewType === "markdown" && <textarea { ...textarea } style={{ height, ...textarea.style }}/> }
                { viewType === "preview" && <div style={{
                    position: "relative",
                    flex: "1 1 " + (height || 0),
                    border: "1px solid #d1dae2",
                    padding: "0.4em 0.8em",
                    borderRadius: 4,
                    width: "100%",
                    background: "#FFF",
                    overflow: "auto"
                }}>
                    <Markdown>{ String(textarea.value || "") }</Markdown>
                </div>
            }
            </div>
            </div>
        </div>
    )
}