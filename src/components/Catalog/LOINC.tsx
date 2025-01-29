import Prefetch from "../generic/Prefetch";
import Catalog  from "./Catalog";


export default function LOINC() {
    return (
        <Prefetch path="/api/aggregator/catalog/loinc">
            {(json) => {
                return <Catalog title="LOINC Laboratories" json={json} />
            }}
        </Prefetch>
    )
}