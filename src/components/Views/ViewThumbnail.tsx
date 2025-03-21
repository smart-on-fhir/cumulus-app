import { useRef }                         from "react"
import { useNavigate, Link }              from "react-router-dom"
import { CustomSelection }                from "../generic/WithSelection"
import { app }                            from "../../types"
import { useAuth }                        from "../../auth"
import { useCommand }                     from "../../hooks"
import { classList, ellipsis, highlight } from "../../utils"
import { BulkDelete }                     from "../../commands/Graphs/BulkDelete"
import { CopyGraph }                      from "../../commands/Graphs/CopyGraph"
import { DeleteGraph }                    from "../../commands/Graphs/DeleteGraph"
import { OpenInAnalyticEnvironment }      from "../../commands/Subscriptions/OpenInAnalyticEnvironment"
import { RequestLineLevelData }           from "../../commands/Graphs/RequestLineLevelData"
import { View }                           from "../../commands/Graphs/View"
import { ShareGraph }                     from "../../commands/Graphs/Share/ShareGraph"
import { ManagePermissions }              from "../../commands/Graphs/Share/ManagePermissions"
import { ToggleFavorite }                 from "../../commands/ToggleFavorite"


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

    const ToggleFavoriteCmd = new ToggleFavorite(view.id, "favoriteGraphs")

    
    const deleteCommand      = useCommand(new DeleteGraph({ graphId: view.id || 0, user: auth.user, navigate, ownerId: view.creatorId }));
    const copyCommand        = useCommand(new CopyGraph(view, auth.user, navigate));
    const bulkDeleteCommand  = useCommand(new BulkDelete({ graphs: selection?.items || [], user: auth.user }))
    const viewCommand        = useCommand(new View(view.id, auth.user, navigate))
    const requestLineData    = useCommand(new RequestLineLevelData(view.id, auth.user, navigate))
    const openInAE           = useCommand(new OpenInAnalyticEnvironment(view.subscriptionId || 0, auth.user))
    const shareCommand       = useCommand(new ShareGraph(view, auth.user));
    // const bulkShareGraph     = useCommand(new BulkShareGraph({ graphs: selection?.items || [], user: auth.user }))
    const permissionsCommand = useCommand(new ManagePermissions(view, auth.user));
    const toggleFavorite     = useCommand(ToggleFavoriteCmd)

    return (
        <Link
            ref={link}
            to={ view.isDraft ? "/drafts/" + view.id : "/views/" + view.id }
            className={ classList({
                "view-thumbnail": true,
                "selected": !!selection?.includes(view),
                "draft": !!view.isDraft
            })}
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
                    permissionsCommand,
                    toggleFavorite
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
                { ToggleFavoriteCmd.on() && <i className="fa-solid fa-star star pr-05"/> }
                { search ? highlight(view.name, search) : view.name }
                { showDescription > 0 && <div className="view-thumbnail-description color-muted" title={ view.description || undefined }>
                    { view.description ?
                        search ?
                            highlight(ellipsis(view.description, showDescription), search) :
                            ellipsis(view.description, showDescription) :
                        "No description"
                    }
                </div> }
            </div>            
        </Link>
    )
}