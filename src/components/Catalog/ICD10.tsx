import Prefetch from "../generic/Prefetch";
import Catalog from "./Catalog";


export default function ICD10() {
    return (
        <Prefetch path="/api/aggregator/catalog">
            {(json) => {
                return <Catalog title="ICD10 Catalog" json={json} />
            }}
        </Prefetch>
    )
}