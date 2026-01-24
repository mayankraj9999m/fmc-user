import React from "react";
import { useLocation } from "./useLocation";
import { matchPath } from "./routerUtils";
import { RouterContext } from "./RouterContext";

const Routes = ({ children }) => {
    const currentPath = useLocation();

    let match = null;
    let params = {};
    let defaultRoute = null;

    React.Children.forEach(children, (child) => {
        if (match) return; // Stop looking if we found a match

        // Save the catch-all for later
        if (child.props.path === "*") {
            defaultRoute = child;
            return;
        }

        const result = matchPath(child.props.path, currentPath);

        if (result) {
            match = child;
            params = result.params;
        }
    });

    const activeChild = match || defaultRoute;

    if (!activeChild) return null;

    return <RouterContext.Provider value={params}>{activeChild}</RouterContext.Provider>;
};

export default Routes;
