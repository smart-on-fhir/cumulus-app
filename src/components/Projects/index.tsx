import { Link } from "react-router-dom"
import { classList } from "../../utils"
import MenuButton from "../MenuButton"
import "./Projects.scss"

export default function Projects()
{
    return (
        <div className="row">
            <div className="col project">
                <h3>Understanding COVID-19</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Vel fringilla est ullamcorper eget nulla. Id volutpat lacus laoreet non curabitur gravida arcu. Ac turpis egestas integer eget aliquet. Erat imperdiet sed euismod nisi porta lorem mollis aliquam ut. Tincidunt ornare massa eget egestas purus viverra accumsan. Suspendisse potenti nullam ac tortor vitae. Scelerisque varius morbi enim nunc faucibus a pellentesque. Eget est lorem ipsum dolor sit. Turpis egestas pretium aenean pharetra. Elementum eu facilisis sed odio morbi quis commodo odio. Tincidunt tortor aliquam nulla facilisi cras. Amet luctus venenatis lectus magna fringilla.</p>
                <br/>
                <br/>
                <div style={{ flex: 1 }}/>
                <div className="row gap color-muted small mb-1" style={{ justifyContent: "space-around" }}>
                    <div className="col col-0">
                        <i>Graphs: <span className="color-brand-2">12</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Created: <span className="color-brand-2">10/12/22</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Updated: <span className="color-brand-2">10/24/22</span></i>
                    </div>
                </div>
                <hr/>
                <div className="center">
                    <div className="btn btn-blue mt-2 p-0">
                        <Link to="/projects/id" className="pl-2 pr-2"><b>Explore</b></Link>
                        <MenuButton right items={[
                            <Link to="/projects/id/edit">
                                <i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Project
                            </Link>,
                            <Link to="/projects/id/delete">
                                <i className="fa-solid fa-trash-can color-red" /> Delete Project
                            </Link>
                        ]}>
                            <i className="fa-solid fa-caret-down small" />
                        </MenuButton>
                    </div>
                </div>
            </div>
            <div className="col project project">
                <h3>Quantifying Behavioral Health Issues</h3>
                <p>Eu mi bibendum neque egestas congue quisque egestas diam in. Faucibus a pellentesque sit amet porttitor eget. Aliquam sem et tortor consequat id porta nibh venenatis. Egestas maecenas pharetra convallis posuere morbi leo urna. Volutpat commodo sed egestas egestas fringilla. Venenatis cras sed felis eget velit aliquet sagittis id. Diam quis enim lobortis scelerisque fermentum dui faucibus in ornare. Massa vitae tortor condimentum lacinia quis vel eros. Hac habitasse platea dictumst quisque sagittis purus. Non enim praesent elementum facilisis. Pellentesque nec nam aliquam sem et tortor consequat id porta. Justo laoreet sit amet cursus. Leo duis ut diam quam nulla porttitor massa id neque. Neque convallis a cras semper auctor. Sit amet cursus sit amet dictum. Placerat orci nulla pellentesque dignissim enim sit amet venenatis urna.</p>
                <br/>
                <br/>
                <div style={{ flex: 1 }}/>
                <div className="row gap color-muted small mb-1" style={{ justifyContent: "space-around" }}>
                    <div className="col col-0">
                        <i>Graphs: <span className="color-brand-2">12</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Created: <span className="color-brand-2">10/12/22</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Updated: <span className="color-brand-2">10/24/22</span></i>
                    </div>
                </div>
                <hr/>
                <div className="center">
                    <div className="btn btn-blue mt-2 p-0">
                        <Link to="/projects/id" className="pl-2 pr-2"><b>Explore</b></Link>
                        <MenuButton right items={[
                            <Link to="/projects/id/edit">
                                <i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Project
                            </Link>,
                            <Link to="/projects/id/delete">
                                <i className="fa-solid fa-trash-can color-red" /> Delete Project
                            </Link>
                        ]}>
                            <i className="fa-solid fa-caret-down small" />
                        </MenuButton>
                    </div>
                </div>
            </div>
            <div className="col project">
                <h3>Simplifying CMS Quality Measures</h3>
                <p>Lacus suspendisse faucibus interdum posuere. Quisque egestas diam in arcu cursus euismod quis. Morbi leo urna molestie at. Quis eleifend quam adipiscing vitae proin sagittis nisl. Sit amet porttitor eget dolor morbi. Ultrices sagittis orci a scelerisque purus semper. Amet facilisis magna etiam tempor orci eu lobortis elementum. Sem integer vitae justo eget magna. Faucibus scelerisque eleifend donec pretium vulputate sapien nec. Nullam non nisi est sit amet facilisis magna. Potenti nullam ac tortor vitae purus. Platea dictumst vestibulum rhoncus est pellentesque elit. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Tempor orci dapibus ultrices in iaculis nunc sed. Amet cursus sit amet dictum sit amet justo donec. Diam vel quam elementum pulvinar etiam. Donec adipiscing tristique risus nec feugiat.</p>
                <br/>
                <br/>
                <div style={{ flex: 1 }}/>
                <div className="row gap color-muted small mb-1" style={{ justifyContent: "space-around" }}>
                    <div className="col col-0">
                        <i>Graphs: <span className="color-brand-2">12</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Created: <span className="color-brand-2">10/12/22</span></i>
                    </div>
                    <div className="col col-0">
                        <i>Updated: <span className="color-brand-2">10/24/22</span></i>
                    </div>
                </div>
                <hr/>
                <div className="center">
                    <div className="btn btn-blue mt-2 p-0">
                        <Link to="/projects/id" className="pl-2 pr-2"><b>Explore</b></Link>
                        <MenuButton right items={[
                            <Link to="/projects/id/edit">
                                <i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Project
                            </Link>,
                            <Link to="/projects/id/delete">
                                <i className="fa-solid fa-trash-can color-red" /> Delete Project
                            </Link>
                        ]}>
                            <i className="fa-solid fa-caret-down small" />
                        </MenuButton>
                    </div>
                </div>
            </div>
        </div>
    )
}