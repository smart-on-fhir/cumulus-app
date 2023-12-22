import { useRef }                    from "react"
import { Link, useNavigate }         from "react-router-dom"
import { CustomSelection }           from "../generic/WithSelection"
import { app }                       from "../../types"
import { useAuth }                   from "../../auth"
import { useCommand }                from "../../hooks"
import { ellipsis, highlight }       from "../../utils"
import { BulkDelete }                from "../../commands/Graphs/BulkDelete"
import { CopyGraph }                 from "../../commands/Graphs/CopyGraph"
import { DeleteGraph }               from "../../commands/Graphs/DeleteGraph"
import { OpenInAnalyticEnvironment } from "../../commands/Subscriptions/OpenInAnalyticEnvironment"
import { RequestLineLevelData }      from "../../commands/Graphs/RequestLineLevelData"
import { View }                      from "../../commands/Graphs/View"
import { ShareGraph }                from "../../commands/Graphs/Share/ShareGraph"
// import { BulkShareGraph }            from "../../commands/Graphs/Share/BulkShareGraph"
import { ManagePermissions }         from "../../commands/Graphs/Share/ManagePermissions"


export default function ViewThumbnail({
    view,
    showDescription = 0,
    search="",
    selection
}: {
    view            : app.View
    showDescription?: number
    search         ?: string
    selected       ?: boolean
    selectable     ?: boolean
    onSelect       ?: (id: number) => void
    selection      ?: CustomSelection<app.View>
}) {
    const auth              = useAuth()
    const navigate          = useNavigate()
    const link              = useRef<HTMLAnchorElement>(null)
    
    const deleteCommand      = useCommand(new DeleteGraph({ graphId: view.id || 0, user: auth.user, navigate, ownerId: view.creatorId }));
    const copyCommand        = useCommand(new CopyGraph(view.id || 0, auth.user, navigate));
    const bulkDeleteCommand  = useCommand(new BulkDelete({ graphs: selection?.items || [], user: auth.user }))
    const viewCommand        = useCommand(new View(view.id, auth.user, navigate))
    const requestLineData    = useCommand(new RequestLineLevelData(view.id, auth.user, navigate))
    const openInAE           = useCommand(new OpenInAnalyticEnvironment(view.DataRequestId || 0, auth.user))
    const shareCommand       = useCommand(new ShareGraph(view, auth.user));
    // const bulkShareGraph     = useCommand(new BulkShareGraph({ graphs: selection?.items || [], user: auth.user }))
    const permissionsCommand = useCommand(new ManagePermissions(view, auth.user));

    return (
        <Link
            ref={link}
            to={ "/views/" + view.id }
            className={"view-thumbnail" + (selection?.includes(view) ? " selected" : "")}
            title={ showDescription ? undefined : view.description || undefined }
            onClick={e => {
                if (selection && e.metaKey) {
                    e.preventDefault()
                    selection.toggle(view)
                }
            }}
            onContextMenu={function (e) {
                // @ts-ignore
                e.nativeEvent.customTarget = link.current;

                let items: any[] = [
                    viewCommand,
                    requestLineData,
                    openInAE,
                    deleteCommand,
                    copyCommand,
                    shareCommand,
                    permissionsCommand
                ];

                if (selection && selection.size() > 1 && selection.includes(view)) {

                    const bulkItems: any[] = [];

                    if (bulkDeleteCommand.available) {
                        bulkItems.push(bulkDeleteCommand)
                    }
                    // if (bulkShareGraph.available) {
                    //     bulkItems.push(bulkShareGraph)
                    // }

                    if (bulkItems.length) {
                        items.unshift({
                            label: "This Graph"
                        })
                        items.push({
                            label: "All Selected Graphs"
                        })

                        items = [ ...items, ...bulkItems ]
                    }
                }

                // @ts-ignore
                e.nativeEvent.menuItems = items;
            }}
        >
            <div className="view-thumbnail-image">
                 <img src={`${(process.env.REACT_APP_BACKEND_HOST || "")}/api/views/${ view.id }/screenshot?v=${+new Date(view.updatedAt!)}`} loading="lazy" alt={view.name} />
            </div>
            <div className="view-thumbnail-title">
                
                <span dangerouslySetInnerHTML={{ __html: search ? highlight(view.name, search) : view.name }}/>
                
                { showDescription > 0 && <div className="view-thumbnail-description color-muted" title={ view.description || undefined }>
                    { view.description ?
                        <span dangerouslySetInnerHTML={{
                            __html: search ?
                                highlight(ellipsis(view.description, showDescription), search) :
                                ellipsis(view.description, showDescription)
                        }}/> :
                        "No description" }
                </div> }
            </div>            
        </Link>
    )
}