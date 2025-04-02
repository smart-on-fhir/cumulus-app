import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider, RequireAuth }    from "../auth";
import Header                           from "./Header";
import Home                             from "./Home";
import Subscriptions                    from "./Subscriptions";
import SubscriptionGroups               from "./SubscriptionGroups";
import DataSiteListPage                 from "./DataSites";
import Navigation                       from "./Navigation";
import Views                            from "./Views";
import Users                            from "./Users";
import LoginPage                        from "./Users/LoginPage"
import Invite                           from "./Users/Invite";
import Account                          from "./Users/Account";
import Activate                         from "./Users/Activate";
import PasswordReset                    from "./Users/PasswordReset";
import StudyAreas                       from "./StudyAreas";
import Tags                             from "./Tags";
import { ContextMenu }                  from "./generic/Menu";
import Tooltip                          from "./generic/Tooltip";
import PermissionsManager               from "./Permissions";
import UserGroups                       from "./UserGroups";
import Studies                          from "./Studies";
import Packages                         from "./DataPackages";
import HealthCheck                      from "./HealthCheck";
import { AggregatorProvider }           from "../Aggregator";
import CatalogRouter                    from "./Catalog";
import { SearchResultsPage }            from "./Search";
import CssPreview                       from "./CssPreview";
import "../styles/main.scss";


export default function App()
{
    return (
        <AuthProvider>
            <AggregatorProvider>
                <ContextMenu />
                <Tooltip />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Header/>
                    <div className="container container-fluid row p-1">
                        <Navigation />
                        <div id="main" className="col">
                            <Routes>
                                <Route path="/">
                                    <Route index                 element={ <RequireAuth><Home /></RequireAuth> } />
                                    <Route path="views/*"        element={ <RequireAuth><Views /></RequireAuth> } />
                                    <Route path="drafts/*"       element={ <RequireAuth><Views /></RequireAuth> } />
                                    <Route path="requests/*"     element={ <RequireAuth><Subscriptions /></RequireAuth> } />
                                    <Route path="sites/*"        element={ <RequireAuth><DataSiteListPage/></RequireAuth> } />
                                    <Route path="groups/*"       element={ <RequireAuth><SubscriptionGroups /></RequireAuth> } />
                                    <Route path="study-areas/*"  element={ <RequireAuth><StudyAreas /></RequireAuth> } />
                                    <Route path="tags/*"         element={ <RequireAuth><Tags /></RequireAuth> } />
                                    <Route path="login"          element={ <LoginPage /> } />
                                    <Route path="activate"       element={ <Activate /> } />
                                    <Route path="password-reset" element={ <PasswordReset /> } />
                                    <Route path="user"           element={ <RequireAuth><Account /></RequireAuth> } />
                                    <Route path="users/invite"   element={ <RequireAuth><Invite /></RequireAuth> } />
                                    <Route path="users"          element={ <RequireAuth><Users /></RequireAuth> } />
                                    <Route path="permissions"    element={ <RequireAuth><PermissionsManager /></RequireAuth> } />
                                    <Route path="health-check"   element={ <RequireAuth><HealthCheck /></RequireAuth> } />
                                    <Route path="search"         element={ <RequireAuth><SearchResultsPage /></RequireAuth>} />
                                    <Route path="user-groups/*"  element={ <RequireAuth><UserGroups /></RequireAuth> } />
                                    <Route path="catalog/*"      element={ <RequireAuth><CatalogRouter /></RequireAuth>} />
                                    <Route path="studies/*"      element={ <RequireAuth><Studies /></RequireAuth>} />
                                    <Route path="packages/*"     element={ <RequireAuth><Packages /></RequireAuth>} />
                                    <Route path="css"            element={ <CssPreview /> } />
                                    <Route path="*"              element="Page Not Found" />
                                </Route>
                            </Routes>
                        </div>
                    </div>
                </BrowserRouter>
            </AggregatorProvider>
        </AuthProvider>
    )
}
