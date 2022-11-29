import { Route, Routes } from "react-router"
import Create from "./Create"
import Delete from "./Delete"
import Edit from "./Edit"
import List from "./List"
import View from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <List /> } />
                <Route path="new" element={ <Create /> } />
                <Route path=":id">
                    <Route index element={ <View /> } />
                    <Route path="edit" element={ <Edit /> } />
                    <Route path="delete" element={ <Delete /> } />
                </Route>
            </Route>
        </Routes>
    )
}