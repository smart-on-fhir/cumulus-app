import { Route, Routes }  from "react-router";
import { RequireAuth }    from "../../auth";
import DataSiteCreateForm from "./Create";
import Delete from "./Delete";
import EditDataSite       from "./Edit";
import ListPage           from "./List";
import View from "./View";


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <RequireAuth><ListPage /></RequireAuth> } />
                <Route path="new" element={ <RequireAuth><DataSiteCreateForm /></RequireAuth> } />
                <Route path=":id">
                    <Route index element={ <RequireAuth><View /></RequireAuth> } />
                    <Route path="edit" element={ <RequireAuth><EditDataSite /></RequireAuth> } />
                    <Route path="delete" element={ <RequireAuth><Delete /></RequireAuth> } />
                </Route>
            </Route>
        </Routes>
    )
}