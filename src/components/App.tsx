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
import DataSiteList                             from "./DataSites";
import DataSiteEditForm                         from "./DataSites/EditForm";

import "../styles/main.scss";
import DataSiteCreateForm from "./DataSites/CreateForm";

export default function App()
{
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header/>
                <div className="container row p-1">
                    <div id="main" className="col">
                        <Routes>
                            <Route path="/">
                                <Route index element={ <RequireAuth><Home /></RequireAuth> } />

                                <Route path="views/:id" element={ <RequireAuth><EditView /></RequireAuth> } />

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
                                    <Route index element={<RequireAuth><DataSiteList/></RequireAuth>} />
                                    <Route path="new" element={ <RequireAuth><DataSiteCreateForm /></RequireAuth> } />
                                    <Route path=":id/edit" element={ <RequireAuth><DataSiteEditForm/></RequireAuth> } />
                                </Route>

                                <Route path="activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />

                                <Route path="groups">
                                    <Route index element={<RequireAuth><RequestGroupList /></RequireAuth>}/>
                                    <Route path="new" element={<RequireAuth><RequestGroupCreateForm /></RequireAuth>} />
                                    <Route path=":id/edit" element={<RequireAuth><RequestGroupEditForm /></RequireAuth>} />
                                </Route>

                                <Route path="/login" element={ <LoginPage /> } />
                                
                                <Route path="*" element="Page Not Found" />
                            </Route>
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}
