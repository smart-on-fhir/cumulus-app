import { Routes, Route, BrowserRouter }         from "react-router-dom";
import { AuthProvider, RequireAuth, LoginPage } from "../auth";
import Header                                   from "./Header";
import Home                                     from "./Home";
import Dashboard, { CreateView }                                from "./Dashboard";
import DataUploader                             from "./DataRequests/DataUploader";
import DataRequestView                          from "./DataRequests/DataRequestView";
import EditDataRequestForm                          from "./DataRequests/UpdateForm";

import "../styles/main.scss";
import DataRequestsListPage from "./DataRequests/DataRequestsListPage";
import CreateDataRequestForm from "./DataRequests/CreateForm";


export default function App()
{
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header/>
                <div className="container row p-1">
                    <div id="main" className="col">
                        <Routes>
                            <Route path="/" element={ <RequireAuth><Home /></RequireAuth> } />

                            <Route path="/views/:id" element={ <RequireAuth><Dashboard /></RequireAuth> } />

                            <Route path="/requests" element={ <RequireAuth><DataRequestsListPage /></RequireAuth> } />
                            <Route path="/requests/new" element={ <RequireAuth><CreateDataRequestForm /></RequireAuth> } />
                            <Route path="/requests/:id" element={ <RequireAuth><DataRequestView /></RequireAuth> } />
                            <Route path="/requests/:id/edit" element={ <RequireAuth><EditDataRequestForm /></RequireAuth> } />
                            <Route path="/requests/:id/import" element={ <RequireAuth><DataUploader /></RequireAuth> } />
                            <Route path="/requests/:id/create-view" element={ <RequireAuth><CreateView /></RequireAuth> } />
                            
                            <Route path="/login" element={ <LoginPage /> } />
                            
                            <Route path="*" element="Page Not Found" />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}
