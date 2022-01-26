import "./ViewsBrowser.scss"
import viewIcon from "./view.png"
import { Link } from "react-router-dom"

const VIEWS = [
    {
        name: "COVID-19 Positive test + loss of taste or smell by demographics"
    },
    {
        name: "COVID-19 Positive test + ICU admissions"
    },
    {
        name: "Influenza Positive test by phenotype by demographics"
    },
    {
        name: "HIV Positive case by demographics"
    }
]



export default function ViewsBrowser() {
    return (
        <div>
            <h4>Browse Views</h4>
            <hr/>
            <div className="row gap center view-browser">
                <div className="col col-2 view-thumbnail view-thumbnail-add-btn">
                    <Link to="#">
                        <div className="view-thumbnail-image">
                            <i className="fas fa-plus"/>
                        </div>
                        <div className="view-thumbnail-title color-blue">Create New View</div>
                    </Link>
                </div>
                { VIEWS.map((v, i) => (
                    <ViewThumbnail key={i} name={ v.name } />
                )) }
            </div>
        </div>
    )
}

function ViewThumbnail(props: { name: string }) {
    return (
        <div className="col col-2 view-thumbnail">
            <Link to="#">
                <div className="view-thumbnail-image">
                    <img src={viewIcon}/>
                </div>
                <div className="view-thumbnail-title">{ props.name }</div>
            </Link>
        </div>
    )
}