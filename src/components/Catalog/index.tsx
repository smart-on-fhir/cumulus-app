import { Route, Routes/*, useNavigate*/ } from "react-router-dom"
import Catalog           from "./Catalog"


export default function Endpoint() {
    // const navigate = useNavigate()

    return (
        <Routes>
            <Route path="/icd10" element={ <Catalog
                title="ICD10 Diagnoses"
                path="/api/aggregator/static/catalog/icd10"
                // navigate={data => {
                //     // console.log(data)
                //     navigate({
                //         pathname: "/packages/core__count_condition_month__003",
                //         search: "filter=" + encodeURIComponent("code_display:matchesCI:" + data.display)
                //         // search: "filter=" + encodeURIComponent("code_display:matchesCI:" + data.display.replace(/\..*/, ""))
                //     })
                //     // http://localhost:3000/api/requests/pkg-api?pkg=core__count_condition_month__003&column=recordeddate_month&stratifier=site&filter=code_display%3AmatchesCI%3AType+1+diabetes+mellitus+without+complication
                // }}
            /> } />
            <Route path="/loinc" element={ <Catalog title="LOINC Laboratories" path="/api/aggregator/static/catalog/loinc" /> } />
        </Routes>
    )
}
