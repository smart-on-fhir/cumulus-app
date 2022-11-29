import { Route, Routes }  from "react-router"
import DataSiteCreateForm from "./Create"
import Delete             from "./Delete"
import EditDataSite       from "./Edit"
import ListPage           from "./List"
import View               from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <ListPage /> } />
                <Route path="new" element={ <DataSiteCreateForm /> } />
                <Route path=":id">
                    <Route index element={ <View /> } />
                    <Route path="edit" element={ <EditDataSite /> } />
                    <Route path="delete" element={ <Delete /> } />
                </Route>
            </Route>
        </Routes>
    )
}