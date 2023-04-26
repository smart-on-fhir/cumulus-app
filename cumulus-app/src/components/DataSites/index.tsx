import { Route, Routes }  from "react-router"
import IfAllowed          from "../generic/IfAllowed"
import DataSiteCreateForm from "./Create"
import Delete             from "./Delete"
import EditDataSite       from "./Edit"
import ListPage           from "./List"
import View               from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <IfAllowed element={ <ListPage /> } permissions="DataSites.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <DataSiteCreateForm /> } permissions="DataSites.create" /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed element={ <View /> } permissions="DataSites.read" /> } />
                    <Route path="edit" element={ <IfAllowed element={ <EditDataSite /> } permissions="DataSites.update" /> } />
                    <Route path="delete" element={ <IfAllowed element={ <Delete /> } permissions="DataSites.delete" /> } />
                </Route>
            </Route>
        </Routes>
    )
}