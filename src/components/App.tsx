import Header from "./Header";
import LoginForm from "./LoginForm";
import {
    BrowserRouter as Router,    
    Routes,
    Route,
    Link
} from "react-router-dom";

import "../styles/main.scss";


export default function App() {
    return (
        <Router>
            <Header />
            <div id="main" className="col">
                <Routes>
                    <Route path="/" element="home" />
                    <Route path="/login" element={ <LoginForm /> } />
                </Routes>
            </div>
        </Router>
    )
}
