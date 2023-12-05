import { Route, Routes } from "react-router"
import IfAllowed         from "../generic/IfAllowed"
import Create            from "./CreateForm"
import Edit              from "./UpdateForm"
import List              from "./DataRequestsListPage"
import View              from "./DataRequestView"
import DataUploader      from "./DataUploader"
import CreateView        from "../Dashboard/CreateView"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index      element={ <IfAllowed element={ <List /> } permissions="Subscriptions.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <Create /> } permissions="Subscriptions.create" /> } />
                <Route path=":id">
                    <Route index              element={ <IfAllowed element={ <View /> } permissions="Subscriptions.read" /> } />
                    <Route path="edit"        element={ <IfAllowed element={ <Edit /> } permissions="Subscriptions.update" /> } />
                    <Route path="import"      element={ <IfAllowed element={ <DataUploader /> } permissions="Subscriptions.update" /> } />
                    <Route path="create-view" element={ <IfAllowed element={ <CreateView /> } permissions="Graphs.create" /> } />
                </Route>
            </Route>
        </Routes>
    )
}
