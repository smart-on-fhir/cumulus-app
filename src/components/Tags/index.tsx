import { Route, Routes } from "react-router-dom"
import IfAllowed         from "../generic/IfAllowed"
import Create            from "./Create"
import Delete            from "./Delete"
import Edit              from "./Edit"
import TagsList          from "./List"
import TagView           from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <IfAllowed element={ <TagsList /> } permissions="Tags.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <Create /> } permissions="Tags.create" /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed element={ <TagView /> } permissions="Tags.read" /> } />
                    <Route path="edit" element={ <IfAllowed element={ <Edit /> } permissions="Tags.update" /> } />
                    <Route path="delete" element={ <IfAllowed element={ <Delete /> } permissions="Tags.delete" /> } />
                </Route>
            </Route>
        </Routes>
    )
}