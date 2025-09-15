import { useNavigate } from "react-router-dom"
import MenuButton      from "../generic/MenuButton"
import { app }         from "../../types"


export function SaveChartButton({
    saving,
    graph,
    save
}: {
    graph: Partial<app.View>
    saving?: boolean
    save: (props?: Partial<app.View>) => Promise<void>
}) {
    const navigate = useNavigate()

    return (
        <div className="btn">
            <span className="menu-button-btn pr-1" onClick={() => save()}>
                <i
                    className={ saving ? "fas fa-circle-notch fa-spin" : "fas fa-save" }
                    style={{ width: "1.2em", color: graph.isDraft ? "#E60" : "inherit" }}
                    onClick={() => save()}
                /> Save
            </span>
            <MenuButton right items={[
                <div style={{ cursor: "default" }} onClick={() => {
                    save({ isDraft: false }).then(() => {
                        if (graph.id) {
                            navigate(`/views/${graph.id}`)
                        }
                    })
                }}>
                    <div style={{ "fontWeight": 500 }}>
                        { graph.isDraft ? "Publish" : "Save Changes" }
                    </div>
                    <div className="small color-muted">
                        Save changes and make this visible in the graphs list
                    </div>
                </div>,
                <div style={{ cursor: "default" }} onClick={() => {
                    save({ isDraft: true }).then(() => {
                        if (graph.id) {
                            navigate(`/my/drafts/${graph.id}`)
                        }
                    })
                }}>
                    <div className="color-brand-2" style={{ "fontWeight": 500 }}>
                        { graph.isDraft ? "Save Draft" : "Switch to Draft" }
                    </div>
                    <div className="small color-muted">
                        Save changes and hide this from the graphs list
                    </div>
                </div>
            ]}>
                <i className="fa-solid fa-caret-down small" />
            </MenuButton>
        </div>
    )
}