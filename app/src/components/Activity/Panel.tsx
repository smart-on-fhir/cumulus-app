import { useCallback, useEffect } from "react"
import moment                     from "moment"
import { Link }                   from "react-router-dom"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { ellipsis }               from "../../utils"
import { AlertError }             from "../generic/Alert"
import Panel                      from "../generic/Panel"
import "./Activity.scss"


export default function ActivityPanel({ limit }: { limit?: number }) {

    const { error, loading, result, execute } = useBackend<app.Activity[]>(
        useCallback(
            () => request(`/api/activity/?order=createdAt:desc&limit=${(limit || 10)}`),
            [limit]
        )
    );

    useEffect(() => { execute() }, [execute]);

    return (
        <Panel title="Recent Activity" loading={loading} menu={[
            <div title="Refresh Activity" onMouseDown={() => execute()}>Refresh</div>,
            <Link to="/activity">View All Activity</Link>
        ]} icon={<i className="fa-solid fa-info-circle" style={{ color: "#999" }} />}>
            <div className="activity-panel">
                { error && <AlertError>{ error + "" }</AlertError> }
                { (!result || !result.length) && <span className="color-muted">No activity found</span> }
                { result && result.map((rec, i) => {
                    const created = moment(rec.createdAt);
                    const now     = moment();

                    let formatted = ""

                    if (created.isSame(now, "day")) {
                        formatted = created.format("HH:mm:ss")
                    } else {
                        formatted = created.format("MM/DD/YY HH:mm:ss")
                    }

                    return (
                        <div key={i} title={rec.message}>
                            <div>{ ellipsis(rec.message, 150) }</div>
                            <div className="color-muted small">
                                { formatted }
                            </div>
                        </div>
                    )
                })}
            </div>
        </Panel>
    )
}