import { useState, useEffect } from "react";

export const useLocation = () => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };

        // Listen for both browser back/forward buttons AND our custom navigate event
        window.addEventListener("popstate", onLocationChange);

        return () => window.removeEventListener("popstate", onLocationChange);
    }, []);

    return currentPath;
};
