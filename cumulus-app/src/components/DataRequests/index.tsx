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
                <Route index      element={ <IfAllowed element={ <List /> } permissions="DataRequests.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <Create /> } permissions="DataRequests.create" /> } />
                <Route path=":id">
                    <Route index              element={ <IfAllowed element={ <View /> } permissions="DataRequests.read" /> } />
                    <Route path="edit"        element={ <IfAllowed element={ <Edit /> } permissions="DataRequests.update" /> } />
                    <Route path="import"      element={ <IfAllowed element={ <DataUploader /> } permissions="DataRequests.update" /> } />
                    <Route path="create-view" element={ <IfAllowed element={ <CreateView /> } permissions="Views.create" /> } />
                </Route>
            </Route>
        </Routes>
    )
}
