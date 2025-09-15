import { app }     from "../../types"
import Breadcrumbs from "../generic/Breadcrumbs"


export function GraphBreadcrumbs({ graph }: { graph: Partial<app.View> }) {
    return (
        <Breadcrumbs historic links={[
            { name: "Home"  , href: "/" },
            graph.isDraft ?
                { name: "Draft Graphs", href: "/my/drafts" } :
                { name: "Graphs"      , href: "/views"  },
            { name: graph.name || "Untitled Graph" }
        ]}/>
    )
}