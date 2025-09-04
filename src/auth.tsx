import * as React                from "react"
import { useLocation, Navigate } from "react-router-dom"
import { auth }                  from "./backend" 
import { app }                   from "./types"
import { useServerEvent }        from "./hooks"
import LocalStorageNS            from "./LocalStorageNS"


interface AuthContextType {
    user   : app.User | null;
    login  : (username: string, password: string, remember?: boolean) => Promise<void>;
    logout : () => Promise<void>;
    update : (props: Partial<app.User>) => void;
    error  : Error | null;
    loading: boolean;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode })
{
    let storedUser = JSON.parse(LocalStorageNS.getItem("user") || "null") as app.User | null;

    // transition for users logged in before permissions were implemented
    if (storedUser && !storedUser.permissions) {
        storedUser.permissions = []
    }

    React.useEffect(() => {
        if (storedUser && !storedUser.permissions?.length) {
            auth.logout();
            LocalStorageNS.removeItem("user");
            setUser(null);
        }
    }, [storedUser])

    const [user , setUser ] = React.useState<app.User|null>(storedUser);
    const [error, setError] = React.useState<Error|null>(null);
    const [loading, setLoading] = React.useState(false);
    const subscribe = useServerEvent()

    async function update(props: Partial<app.User>) {
        const updatedUser = { ...user, ...props } as app.User;
        LocalStorageNS.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser)
    }
  
    async function login(username: string, password: string, remember = false) {

        return auth.login(username, password, remember).then(
            user => {
                LocalStorageNS.setItem("user", JSON.stringify(user));
                setUser(user)
                setError(null)
            },
            error => {
                LocalStorageNS.removeItem("user");
                setUser(null)
                setError(error)
            });
    };

    async function logout() {
        if (user) {
            setLoading(true)
            auth.logout()
            LocalStorageNS.removeItem("user")
            setUser(null)
            setLoading(false)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => subscribe("userSync", update), [])

    return (
        <AuthContext.Provider value={{ user, login, logout, error, loading, update }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return React.useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
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
