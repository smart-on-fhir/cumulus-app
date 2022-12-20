import { Route, Routes } from "react-router"
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
                <Route index element={ <IfAllowed permissions="Projects.read" element={ <List /> } /> } />
                <Route path="new" element={ <IfAllowed permissions="Projects.create" element={ <Create /> } /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed permissions="Projects.read" element={ <View /> } /> } />
                    <Route path="edit" element={ <IfAllowed permissions="Projects.update" element={ <Edit /> } /> } />
                    <Route path="delete" element={ <IfAllowed permissions="Projects.delete" element={ <Delete /> } /> } />
                </Route>
            </Route>
        </Routes>
    )
}