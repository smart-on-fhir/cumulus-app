import * as ReactRouterDom from "react-router-dom";

const Link = ({ to, ...props }: { to: string } & React.ComponentProps<typeof ReactRouterDom.Link>) => {
    // const location = ReactRouterDom.useLocation();
    const isInsideExplorer = ReactRouterDom.useMatch("/explorer/*"); // Matches any route under /explorer

    // Only modify the URL if inside /explorer and the target path is absolute
    const adjustedTo = isInsideExplorer && to.startsWith("/") ? `/explorer${to}` : to;

    return <ReactRouterDom.Link to={adjustedTo} {...props} />;
};

export default Link;
