import * as React from "react";
import {
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom";


interface AuthContextType {
    user: app.User | null;
    login: (username: string, password: string, remember?: boolean) => void;
    logout: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode })
{
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null") as app.User | null;

    let [user, setUser] = React.useState<app.User|null>(storedUser);
  
    function login(username: string, password: string, remember = false) {
        setUser({ username });

        if (remember) {
            sessionStorage.setItem("user", JSON.stringify({ username }));
        } else {
            sessionStorage.removeItem("user");
        }
    };

    function logout() {
        sessionStorage.removeItem("user");
        setUser(null);
    }
  
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return React.useContext(AuthContext);
}

export function RequireAuth({ children }: { children: JSX.Element }) {
    let auth = useAuth();
    let location = useLocation();
  
    if (!auth.user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    return children;
}

export function LoginPage() {
    let navigate = useNavigate();
    let location = useLocation();
    let auth     = useAuth();
  
    // @ts-ignore
    let from = location.state?.from?.pathname || "/";
  
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
    
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") as string;
    
        auth.login(username, password, remember === "true");
        
        // Send them back to the page they tried to visit when they were
        // redirected to the login page. Use { replace: true } so we don't create
        // another entry in the history stack for the login page.  This means that
        // when they get to the protected page and click the back button, they
        // won't end up back on the login page, which is also really nice for the
        // user experience.
        navigate(from, { replace: true });
    }
  
    return (
        <form className="container row p-1 center" onSubmit={handleSubmit}>
            <div className="col" style={{ maxWidth: "28rem"}}>
                <h3>Boston Children's Hospital</h3>
                <hr/>
                <br/>
                <div className="row center">
                    <div className="col">
                        <label>Email</label>
                        <input type="text" name="username" autoComplete="username" />
                        <label className="mt-1">Password</label>
                        <input type="password" name="password" autoComplete="current-password" />
                        <label className="mt-1">
                            <input type="checkbox" name="remember" value="true"/> Remember Me
                        </label>
                        <button type="submit" className="btn-blue mt-2 mb-2">Login</button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export function AuthStatus() {
    let auth = useAuth();
    let navigate = useNavigate();
  
    if (!auth.user) {
      return <p>You are not logged in.</p>;
    }

    return (
        <>
            <i className="fas fa-user-circle" style={{ fontSize: "200%", verticalAlign: "middle" }}/> <b>{auth.user.username}</b>
            <a className="ml-1 underline" href="#" onClick={() => {auth.logout();navigate("/");}}><b>SIGN OUT</b></a>
        </>
    )
}