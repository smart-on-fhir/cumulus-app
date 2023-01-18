import { Link } from "react-router-dom";
import { ellipsis, highlight } from "../../utils";


export default function ViewThumbnail({
    view,
    showDescription = 0,
    search=""
}: {
    view: app.View,
    showDescription?: number,
    search?: string
}) {
    return (
        <Link to={ "/views/" + view.id } className="view-thumbnail" title={ showDescription ? undefined : view.description || undefined }>
            <div className="view-thumbnail-image" style={{ backgroundImage: `url('${(process.env.REACT_APP_BACKEND_HOST || "")}/api/views/${ view.id }/screenshot` }}/>
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