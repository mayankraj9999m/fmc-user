export const navigate = (href) => {
    // Update the browser URL without reloading
    window.history.pushState({}, "", href);

    // Dispatch a custom event so our hooks know to update
    const navEvent = new PopStateEvent("popstate");
    window.dispatchEvent(navEvent);
};
