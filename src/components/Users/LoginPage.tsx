import { useLocation, useNavigate } from "react-router"
import { useState }                 from "react"
import { AlertError }               from "../generic/Alert"
import { useAuth }                  from "../../auth"
import { Link } from "react-router-dom";


export default function LoginPage() {
    let navigate = useNavigate();
    let location = useLocation();
    let auth     = useAuth();
  
    const [loading, setLoading] = useState(false);

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
                        <div className="row mt-1">
                            <div className="col middle">
                                <label>
                                    <input type="checkbox" name="remember" value="true"/> Remember Me
                                </label>
                            </div>
                            <div className="col middle right">
                                <Link className="link color-red" to="/password-reset">Forgot Password</Link>
                            </div>
                        </div>
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