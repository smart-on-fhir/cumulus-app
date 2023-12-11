import * as React     from "react"
import { auth }       from "./backend" 
import { AlertError } from "./components/generic/Alert"
import { app }        from "./types"
import {
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom"


interface AuthContextType {
    user   : app.User | null;
    login  : (username: string, password: string, remember?: boolean) => Promise<void>;
    logout : () => Promise<void>;
    update : (props: Partial<app.User>) => void;
    sync   : () => Promise<void>;
    error  : Error | null;
    loading: boolean;
}

let AuthContext = React.createContext<AuthContextType>(null!);

let timer: NodeJS.Timeout, delay = 1000;

export function AuthProvider({ children }: { children: React.ReactNode })
{
    let storedUser = JSON.parse(localStorage.getItem("user") || "null") as app.User | null;

    // transition for users logged in before permissions were implemented
    if (storedUser && !storedUser.permissions) {
        storedUser.permissions = []
    }

    React.useEffect(() => {
        if (storedUser && !storedUser.permissions?.length) {
            auth.logout();
            localStorage.removeItem("user");
            setUser(null);
        }
    }, [storedUser])

    const [user , setUser ] = React.useState<app.User|null>(storedUser);
    const [error, setError] = React.useState<Error|null>(null);
    const [loading, setLoading] = React.useState(false);

    async function update(props: Partial<app.User>) {
        const updatedUser = { ...user, ...props } as app.User;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser)
    }
  
    async function login(username: string, password: string, remember = false) {

        return auth.login(username, password, remember).then(
            user => {
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user)
                setError(null)
            },
            error => {
                localStorage.removeItem("user");
                setUser(null)
                setError(error)
            });
    };

    async function logout() {
        if (user) {
            setUser(null)
            setLoading(true)
            await auth.logout()
            localStorage.removeItem("user")
            setLoading(false)
        }
        window.location.href = "/login"
    }

    const sync = React.useCallback(() => {
        return auth.sync().then(user => {
            const json = JSON.stringify(user)
            if (JSON.stringify(storedUser) !== json) {
                localStorage.setItem("user", json);
                setUser(user);
                delay = 1000
            }
        })
    }, [storedUser])

    React.useEffect(() => {
        const _sync = () => {
            if (timer) {
                clearTimeout(timer)
            }
            sync().finally(() => {
                delay = Math.min(delay * 1.1, 60000)
                timer = setTimeout(_sync, delay)
            })
        }
        timer = setTimeout(_sync, delay)
        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [sync])
  
    return (
        <AuthContext.Provider value={{ user, login, logout, error, loading, update, sync }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
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
  
    const [loading, setLoading] = React.useState(false);

    // @ts-ignore
    let from = location.state?.from?.pathname || "/";
  
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
    
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") as string;
    
        await auth.login(username, password, remember === "true");

        setLoading(false);
        
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
                <div className="row">
                    <div className="col center">
                        <h3>Boston Children's Hospital</h3>
                    </div>
                </div>
                <hr className="mt-1 mb-1" />
                <div className="row">
                    <div className="col col-10">
                        { auth.error && <AlertError className="left">{ auth.error.message }</AlertError> }
                    </div>
                </div>
                <div className="row left">
                    <div className="col">
                        <label>Email</label>
                        <input type="text" name="username" autoComplete="username" required />
                        <label className="mt-1">Password</label>
                        <input type="password" name="password" autoComplete="current-password" required />
                        <label className="mt-1">
                            <input type="checkbox" name="remember" value="true"/> Remember Me
                        </label>
                        <hr className="mt-1 mb-2" />
                        <div className="row">
                            <div className="col"/>
                            <div className="col">
                                <button type="submit" className="btn-blue mb-2">
                                    { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                                    Login
                                </button>
                            </div>
                            <div className="col"/>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

