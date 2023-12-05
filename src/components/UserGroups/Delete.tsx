import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import { app }              from "../../types"
import { UserGrid }         from "./UserGrid"


export default function Delete()
{
    return createDeletePage<app.UserGroup>({
        endpoint    : "/api/user-groups",
        namePlural  : "User Groups",
        nameSingular: "User Group",
        icon        : <i className="fa-solid fa-user-friends color-brand-2" />,
        query       : "users=true",
        renderView  : data => <>
            <div className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                <span className="color-muted">Description: </span> {
                    data.description ? 
                        <Clip max={400} txt={ data.description } /> :
                        <span className="color-muted">No description provided</span>
                }
            </div>
            { data.users!.length > 0 && (
                <>
                    <div className="mt-05 row gap wrap">
                        <div className="col col-5 responsive">
                            <h6>
                                <i className="fa-solid fa-link-slash color-brand-2" /> The following users will no longer belong to this group:
                            </h6>
                            <hr/>
                            <UserGrid users={data.users as any} />
                        </div>
                    </div>
                </>
            )}
        </>
    })
}
