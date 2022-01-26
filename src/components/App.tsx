import { Routes, Route, BrowserRouter }                        from "react-router-dom";
import Header                                   from "./Header";
import Home                                     from "./Home";
import { AuthProvider, RequireAuth, LoginPage } from "../auth";
import "../styles/main.scss";


export default function App() {

    return (
        <AuthProvider>
            <BrowserRouter>
                <Header/>
                <div className="container row p-1">
                    <div id="main" className="col">
                        <Routes>
                            <Route path="/" element={ <RequireAuth><Home /></RequireAuth> } />
                            <Route path="/login" element={ <LoginPage /> } />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    )
}
