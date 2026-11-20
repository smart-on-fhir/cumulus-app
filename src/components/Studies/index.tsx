import { Route, Routes } from "react-router-dom"
import StudyBuilder      from "./StudyBuilder"
import ListSites         from "./ListStudies"
import ViewStudy         from "./ViewStudy"
import ViewStudyVersion  from "./ViewStudyVersion"
import StudySummary      from "./Summary"
import DataPackageView   from "../DataPackages/DataPackageView"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/">
                <Route index element={ <ListSites /> } />
                <Route path="new" element={ <StudyBuilder /> } />
                <Route path=":studyId">
                    <Route index element={ <ViewStudy /> } />
                    <Route path="packages/:id" element={ <DataPackageView /> } />
                    <Route path=":version" element={ <ViewStudyVersion /> } />
                    <Route path=":version/summary" element={ <StudySummary /> } />
                </Route>
            </Route>
        </Routes>
    )
}