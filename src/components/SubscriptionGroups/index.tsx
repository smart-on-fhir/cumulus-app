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
                <Route index element={ <IfAllowed element={ <List /> } permissions="SubscriptionGroups.read" /> } />
                <Route path="new" element={ <IfAllowed element={ <Create /> } permissions="SubscriptionGroups.create" /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed element={ <View /> } permissions="SubscriptionGroups.read" /> } />
                    <Route path="edit" element={ <IfAllowed element={ <Edit /> } permissions="SubscriptionGroups.update" /> } />
                    <Route path="delete" element={ <IfAllowed element={ <Delete /> } permissions="SubscriptionGroups.delete" /> } />
                </Route>
            </Route>
        </Routes>
    )
}
