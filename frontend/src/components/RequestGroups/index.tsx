import { Route, Routes }  from "react-router"
import IfAllowed          from "../generic/IfAllowed"
import RequestGroupCreate from "./Create"
import DeleteRequestGroup from "./Delete"
import RequestGroupEdit   from "./Edit"
import RequestGroupList   from "./List"
import RequestGroupView   from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <IfAllowed element={ <RequestGroupList /> } permissions="RequestGroups.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <RequestGroupCreate /> } permissions="RequestGroups.create" /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed element={ <RequestGroupView /> } permissions="RequestGroups.read" /> } />
                    <Route path="edit" element={ <IfAllowed element={ <RequestGroupEdit /> } permissions="RequestGroups.update" /> } />
                    <Route path="delete" element={ <IfAllowed element={ <DeleteRequestGroup /> } permissions="RequestGroups.delete" /> } />
                </Route>
            </Route>
        </Routes>
    )
}
