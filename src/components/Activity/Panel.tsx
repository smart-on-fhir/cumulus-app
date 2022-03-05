import { useCallback, useEffect } from "react"
import moment                     from "moment"
import { Link }                   from "react-router-dom"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../Alert"
import { classList }              from "../../utils"
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
        <>
            <div className="row gap baseline">
                <div className="col">
                    <h4>Recent Activity</h4>
                </div>
                <div className="col col-0">
                    <i
                        title="Refresh Activity"
                        className={ classList({
                            "fa-solid fa-rotate color-muted": true,
                            "fa-spin grey-out fa-spin": loading
                        })}
                        style={{ cursor: "pointer" }}
                        onClick={ () => execute() }
                    />
                </div>
            </div>
            <hr/>
            <div className="activity-panel">
                { error && <AlertError>{ error + "" }</AlertError> }
                { (!result || !result.length) && <span className="color-muted">No activity found</span> }
                { result && result.map((rec, i) => {
                    const created = moment(rec.createdAt);
                    const now     = moment(rec.createdAt);

                    let formatted = ""

                    if (created.isSame(now, "day")) {
                        formatted = created.format("HH:mm:ss")
                    } else {
                        formatted = created.format("MM/DD/YY HH:mm:ss")
                    }

                    return (
                        <div className="row" key={i}>
                            <div className="col">{ rec.message }</div>
                            <div className="col col-0 color-muted right small">
                                { formatted }
                            </div>
                        </div>
                    )
                })}
            </div>
            <Link to="/activity" className="color-blue underline">View All Activity</Link>
        </>
    )
}