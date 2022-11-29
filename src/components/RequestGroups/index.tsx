import { Route, Routes }  from "react-router"
import RequestGroupCreate from "./Create"
import DeleteRequestGroup from "./Delete"
import RequestGroupEdit   from "./Edit"
import RequestGroupList   from "./List"
import RequestGroupView   from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <RequestGroupList /> } />
                <Route path="new" element={ <RequestGroupCreate /> } />
                <Route path=":id">
                    <Route index element={ <RequestGroupView /> } />
                    <Route path="edit" element={ <RequestGroupEdit /> } />
                    <Route path="delete" element={ <DeleteRequestGroup /> } />
                </Route>
            </Route>
        </Routes>
    )
}
