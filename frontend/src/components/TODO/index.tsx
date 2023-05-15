import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation } from "react-router";

export default function TODO()
{

    const { pathname } = useLocation()

    return (
        <div className="row center middle" style={{ flex: 1 }}>
            <HelmetProvider>
                <Helmet>
                    <title>Page Not Implemented</title>
                </Helmet>
            </HelmetProvider>
            <div className="col center middle">
                <h2>Not Implemented</h2>
                <p className="text-muted">
                    The page for <span className="color-blue-dark">{ pathname }</span> has
                    not been implemented yet.<br />
                    Please try again later.
                </p>
                <br/>
            </div>
        </div>
    )
}