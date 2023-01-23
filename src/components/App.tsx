import { Routes, Route, BrowserRouter }         from "react-router-dom";
import { AuthProvider, RequireAuth, LoginPage } from "../auth";
import Header                                   from "./Header";
import Home                                     from "./Home/index2";
import EditView                                 from "./Dashboard/EditView";
import Subscriptions                            from "./DataRequests"
import ActivityPage                             from "./Activity/Page";
import RequestGroups                            from "./RequestGroups";
import DataSiteListPage                         from "./DataSites";
import RequestDataForm                          from "./Dashboard/RequestDataForm";
import Navigation                               from "./Navigation";
import Views                                    from "./Views";
import Users                                    from "./Users";
import Invite                                   from "./Users/Invite";
import Account                                  from "./Users/Account";
import Activate                                 from "./Users/Activate";
import Projects                                 from "./Projects";
import LogViewer                                from "./LogViewer";
import Tags                                     from "./Tags";
import { ContextMenu }                          from "./generic/Menu";
import "../styles/main.scss";

export default function App()
{
    return (
        <AuthProvider>
            <ContextMenu />
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
                                        <Route index               element={ <RequireAuth><EditView /></RequireAuth> } />
                                        <Route path="request-data" element={ <RequireAuth><RequestDataForm /></RequireAuth> } />
                                        <Route path="copy"         element={ <RequireAuth><EditView copy /></RequireAuth> } />
                                    </Route>
                                </Route>

                                <Route path="requests/*"   element={ <RequireAuth><Subscriptions /></RequireAuth> } />
                                <Route path="sites/*"      element={ <RequireAuth><DataSiteListPage/></RequireAuth> } />
                                <Route path="groups/*"     element={ <RequireAuth><RequestGroups /></RequireAuth> } />
                                <Route path="projects/*"   element={ <RequireAuth><Projects /></RequireAuth> } />
                                <Route path="tags/*"       element={ <RequireAuth><Tags /></RequireAuth> } />
                                <Route path="activity"     element={ <RequireAuth><ActivityPage /></RequireAuth> } />
                                <Route path="logs"         element={ <RequireAuth><LogViewer /></RequireAuth>} />
                                <Route path="login"        element={ <LoginPage /> } />
                                <Route path="activate"     element={ <Activate/> } />
                                <Route path="user"         element={ <RequireAuth><Account /></RequireAuth> } />
                                <Route path="users/invite" element={ <RequireAuth><Invite /></RequireAuth> } />
                                <Route path="users"        element={ <RequireAuth><Users /></RequireAuth> } />
                                
                                <Route path="*" element="Page Not Found" />
                            </Route>
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}
