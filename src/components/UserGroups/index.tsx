import { Route, Routes } from "react-router-dom"
import IfAllowed         from "../generic/IfAllowed"
import Create            from "./Create"
import Delete            from "./Delete"
import Edit              from "./Edit"
import List              from "./List"
import View              from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <IfAllowed element={ <List /> } permissions="UserGroups.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <Create /> } permissions="UserGroups.create" /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed element={ <View /> } permissions="UserGroups.read" /> } />
                    <Route path="edit" element={ <IfAllowed element={ <Edit /> } permissions="UserGroups.update" /> } />
                    <Route path="delete" element={ <IfAllowed element={ <Delete /> } permissions="UserGroups.delete" /> } />
                </Route>
            </Route>
        </Routes>
    )
}