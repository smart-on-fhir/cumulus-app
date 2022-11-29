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
import RequestGroups                            from "./RequestGroups";
import DataSiteListPage                         from "./DataSites";
import RequestDataForm                          from "./Dashboard/RequestDataForm";
import Navigation                               from "./Navigation"
import TODO                                     from "./TODO";
import Views                                    from "./Views";
import Users                                    from "./Users";
import Invite                                   from "./Users/Invite";
import Account                                  from "./Users/Account";
import Activate                                 from "./Users/Activate";
import Projects                                 from "./Projects";
import EditProject                              from "./Projects/Edit";
import CreateProject                            from "./Projects/Create";
import ViewProject                              from "./Projects/View";
import DeleteProject                            from "./Projects/Delete";
import LogViewer                                from "./LogViewer";
import Tags                                     from "./Tags";
import DeleteTag                                from "./Tags/Delete";
import CreateTag                                from "./Tags/Create";
import EditTag                                  from "./Tags/Edit";
import ViewTag                                  from "./Tags/View";
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

                                <Route path="sites/*" element={ <RequireAuth><DataSiteListPage/></RequireAuth> } />

                                <Route path="activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />
                                <Route path="logs" element={<RequireAuth><LogViewer /></RequireAuth>} />

                                <Route path="groups/*" element={<RequireAuth><RequestGroups /></RequireAuth>}/>

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

                                <Route path="tags">
                                    <Route index element={ <Tags /> } />
                                    <Route path="new" element={ <CreateTag /> } />
                                    <Route path=":id" element={ <ViewTag /> } />
                                    <Route path=":id/edit" element={ <EditTag /> } />
                                    <Route path=":id/delete" element={ <DeleteTag/> } />
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
