import { Route, Routes } from "react-router-dom"
import LOINC             from "./LOINC"
import ICD10             from "./ICD10"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/icd10" element={ <ICD10 /> } />
            <Route path="/loinc" element={ <LOINC /> } />
        </Routes>
    )
}
