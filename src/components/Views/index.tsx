import { Route, Routes }   from "react-router-dom";
import ListViews           from "./ListViews";
import EditView            from "../Dashboard/EditView";
import RequestDataForm     from "../Dashboard/RequestDataForm";
import CopyView            from "../Dashboard/CopyView";


export default function Views() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <ListViews /> } />
                <Route path=":id">
                    <Route index               element={ <EditView /> } />
                    <Route path="request-data" element={ <RequestDataForm /> } />
                    <Route path="copy"         element={ <CopyView /> } />
                </Route>
            </Route>
        </Routes>
    )
}