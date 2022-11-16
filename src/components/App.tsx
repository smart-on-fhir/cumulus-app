import { Routes, Route, BrowserRouter }         from "react-router-dom";
import { AuthProvider, RequireAuth, LoginPage } from "../auth";
import Header                                   from "./Header";
import Home                                     from "./Home";
import EditView                                 from "./Dashboard/EditView";
import CreateView                               from "./Dashboard/CreateView";
import DataUploader                             from "./DataRequests/DataUploader";
import DataRequestView                          from "./DataRequests/DataRequestView";
import EditDataRequestForm                      from "./DataRequests/UpdateForm";
import DataRequestsListPage                     from "./DataRequests/DataRequestsListPage";
import CreateDataRequestForm                    from "./DataRequests/CreateForm";
import ActivityPage                             from "./Activity/Page";
import RequestGroupList                         from "./RequestGroups";
import RequestGroupEditForm                     from "./RequestGroups/EditForm";
import RequestGroupCreateForm                   from "./RequestGroups/CreateForm";
import DataSiteListPage                         from "./DataSites";
import DataSiteEditForm                         from "./DataSites/EditForm";
import DataSiteCreateForm                       from "./DataSites/CreateForm";
import RequestDataForm                          from "./Dashboard/RequestDataForm";
import Navigation                               from "./Navigation"
import TODO                                     from "./TODO";
import Projects                                 from "./Projects";
import Views                                    from "./Views";
import Users                                    from "./Users";
import Invite                                   from "./Users/Invite";
import Account                                  from "./Users/Account";
import Activate                                 from "./Users/Activate";
import EditProject                              from "./Projects/Edit";
import CreateProject                            from "./Projects/Create";
import ViewProject                              from "./Projects/View";
import DeleteProject                            from "./Projects/Delete";
import LogViewer                                from "./LogViewer";
import "../styles/main.scss";

export default function App()
{
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header/>
                <div className="container container-fluid row p-1">
                    <Navigation />
                    <div id="main" className="col">
                        <Routes>
                            <Route path="/">
                                <Route index element={ <RequireAuth><Home /></RequireAuth> } />

                                <Route path="views">
                                    <Route index element={ <Views /> } />
                                    <Route path=":id">
                                        <Route index element={ <RequireAuth><EditView /></RequireAuth> } />
                                        <Route path="request-data" element={ <RequireAuth><RequestDataForm /></RequireAuth> } />
                                    </Route>
                                </Route>

                                <Route path="requests">
                                    <Route index element={ <RequireAuth><DataRequestsListPage /></RequireAuth> } />
                                    <Route path="new" element={ <RequireAuth><CreateDataRequestForm /></RequireAuth> } />
                                    <Route path=":id">
                                        <Route index element={ <RequireAuth><DataRequestView /></RequireAuth> } />
                                        <Route path="edit" element={ <RequireAuth><EditDataRequestForm /></RequireAuth> } />
                                        <Route path="import" element={ <RequireAuth><DataUploader /></RequireAuth> } />
                                        <Route path="create-view" element={ <RequireAuth><CreateView /></RequireAuth> } />
                                    </Route>
                                </Route>

                                <Route path="sites">
                                    <Route index element={<RequireAuth><DataSiteListPage/></RequireAuth>} />
                                    <Route path="new" element={ <RequireAuth><DataSiteCreateForm /></RequireAuth> } />
                                    <Route path=":id/edit" element={ <RequireAuth><DataSiteEditForm/></RequireAuth> } />
                                </Route>

                                <Route path="activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />
                                <Route path="logs" element={<RequireAuth><LogViewer /></RequireAuth>} />

                                <Route path="groups">
                                    <Route index element={<RequireAuth><RequestGroupList /></RequireAuth>}/>
                                    <Route path="new" element={<RequireAuth><RequestGroupCreateForm /></RequireAuth>} />
                                    <Route path=":id/edit" element={<RequireAuth><RequestGroupEditForm /></RequireAuth>} />
                                </Route>

                                <Route path="login" element={ <LoginPage /> } />






                                <Route path="activate" element={ <Activate/> } />
                                <Route path="user" element={ <RequireAuth><Account /></RequireAuth> } />
                                <Route path="activity" element={ <TODO /> } />
                                <Route path="settings" element={ <TODO /> } />
                                <Route path="users">
                                    <Route index element={ <RequireAuth><Users /></RequireAuth> } />
                                    <Route path="invite" element={ <RequireAuth><Invite /></RequireAuth> } />
                                </Route>
                                <Route path="permissions" element={ <TODO /> } />                                
                                <Route path="projects">
                                    <Route index element={ <Projects /> } />
                                    <Route path="new" element={ <CreateProject /> } />
                                    <Route path=":id" element={ <ViewProject /> } />
                                    <Route path=":id/edit" element={ <EditProject /> } />
                                    <Route path=":id/delete" element={ <DeleteProject /> } />
                                </Route>





                                
                                <Route path="*" element="Page Not Found" />
                            </Route>
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}
