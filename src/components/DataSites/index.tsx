import { Route, Routes }  from "react-router-dom"
import ListPage           from "./List"
import View               from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <ListPage /> } />
                <Route path=":id" element={ <View /> } />
            </Route>
        </Routes>
    )
}