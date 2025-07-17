import { Route, Routes } from "react-router-dom"
import Catalog           from "./Catalog"


export default function Endpoint() {
    return (
        <Routes>
            <Route path="/icd10" element={ <Catalog title="ICD10 Diagnoses" path="/api/aggregator/static/catalog/icd10" key="icd10" /> } />
            <Route path="/loinc" element={ <Catalog title="LOINC Laboratories" path="/api/aggregator/static/catalog/loinc" key="loinc" /> } />
        </Routes>
    )
}
