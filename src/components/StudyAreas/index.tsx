import { Route, Routes } from "react-router"
import IfAllowed         from "../generic/IfAllowed"
import Create            from "./Create"
import Delete            from "./Delete"
import Edit              from "./Edit"
import ListStudyAreas    from "./List"
import ViewStudyArea     from "./View"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <IfAllowed permissions="StudyAreas.read" element={ <ListStudyAreas /> } /> } />
                <Route path="new" element={ <IfAllowed permissions="StudyAreas.create" element={ <Create /> } /> } />
                <Route path=":id">
                    <Route index element={ <IfAllowed permissions="StudyAreas.read" element={ <ViewStudyArea /> } /> } />
                    <Route path="edit" element={ <IfAllowed permissions="StudyAreas.update" element={ <Edit /> } /> } />
                    <Route path="delete" element={ <IfAllowed permissions="StudyAreas.delete" element={ <Delete /> } /> } />
                </Route>
            </Route>
        </Routes>
    )
}