import { Route, Routes } from "react-router"
import StudyBuilder      from "./StudyBuilder"
import ListSites         from "./ListStudies"
import ViewStudy         from "./ViewStudy"
import ViewStudyVersion  from "./ViewStudyVersion"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <ListSites /> } />
                <Route path="new" element={ <StudyBuilder /> } />
                <Route path=":id">
                    <Route index element={ <ViewStudy /> } />
                    <Route path=":version" element={ <ViewStudyVersion /> } />
                </Route>
            </Route>
        </Routes>
    )
}