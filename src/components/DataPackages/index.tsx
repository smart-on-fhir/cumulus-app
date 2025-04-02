import { Route, Routes } from "react-router-dom"
import DataPackageView   from "./DataPackageView"
import DataPackageList   from "./DataPackageList"


export default function Packages() {
    return (
        <Routes>
            <Route index element={ <DataPackageList /> } />
            <Route path=":id" element={ <DataPackageView /> } />
        </Routes>
    )
}