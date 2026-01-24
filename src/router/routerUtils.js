/**
 * Matches a route pattern against the current path and extracts parameters
 * @param {string} routePattern - The route pattern (e.g., "/user/:id", "/posts/:postId")
 * @param {string} currentPath - The current URL path
 * @returns {Object|null} - Returns { match: true, params: {...} } if matched, null if no match
 */
export const matchPath = (routePattern, currentPath) => {
    // Handle wildcard route - matches any path
    if (routePattern === "*") return { match: true, params: {} };

    // Remove trailing slash from pattern (except for root "/")
    // Example: "/user/" becomes "/user", but "/" stays "/"
    const cleanPattern = routePattern === "/" ? routePattern : routePattern.replace(/\/$/, "");

    // Array to store parameter names extracted from the route pattern
    // Example: for "/user/:id/posts/:postId", paramNames will be ["id", "postId"]
    const paramNames = [];

    // Convert route pattern to a regular expression
    // Replace :paramName with a regex group that captures any characters except "/"
    // Example: "/user/:id" becomes "/user/([^/]+)"
    const regexPath = cleanPattern.replace(/:([^\/]+)/g, (_, paramName) => {
        paramNames.push(paramName); // Store the parameter name
        return "([^/]+)"; // Return regex pattern to capture this parameter
    });

    // Create the final regex with ^ and $ anchors to match the entire path
    // \\/ ensures forward slashes are treated literally (not as regex operators)
    // \\/?$ allows optional trailing slash at the end
    const regex = new RegExp(`^${regexPath}\\/?$`);

    // Try to match the current path against the regex pattern
    const match = currentPath.match(regex);

    // If no match found, return null
    if (!match) return null;

    // Extract captured groups from the regex match and map them to parameter names
    const params = {};
    match.slice(1).forEach((value, index) => {
        // match[0] is the entire matched string, so we skip it with slice(1)
        // Then map each captured value to its corresponding parameter name
        params[paramNames[index]] = value;
    });

    // Return matched result with extracted parameters
    // Example: { match: true, params: { id: "123" } }
    return { match: true, params };
};
