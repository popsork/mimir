export default defineNuxtRouteMiddleware(async (to, from) => {
    // this middleware contains navigation guards
    // to control which pages the user can access depending on whether he is authenticated
    // based on metadata defined for each page.
    // this also handles automatic redirects depending on the authentication state and its changes
    // (reacting to authentication state changes is done in useAuthenticationStateTracking.ts)
    const authenticationStore = useAuthenticationStore();
    const userAuthenticationStateIsKnown = authenticationStore.userAuthenticationStateIsKnown;

    if (!userAuthenticationStateIsKnown) {
        await authenticationStore.loadCurrentUser();
    }

    const userIsAuthenticated = authenticationStore.userAuthenticated;

    // redirect from root either to /welcome or /dashboard depending on authentication state
    if (to.name === "index") {
        if (userIsAuthenticated) {
            return goToRoute({ name: "dashboard" }, { replace: true });
        } else {
            return goToRoute({ name: "welcome", query: { continue: to.query.continue } }, { replace: true });
        }
    }

    if (!userIsAuthenticated && to.matched.some(route => route.meta.anonymousAccess !== true)) {
        // page or one of its parents requires authentication, user is not authenticated,
        // redirect to root, which will redirect to the default unauthenticated start page (/welcome)
        return goToRoute({ name: "index", query: { continue: to.fullPath } }, { replace: true });
    }

    if (userIsAuthenticated && to.matched.some(record => record.meta.authenticatedAccess === false)) {
        // page not allowed for authenticated users, user is authenticated,
        // redirect to root, which will redirect to default authenticated start page (/dashboard)
        if (from && from.name === "index") {
            return false;
        }

        return goToRoute({ name: "index" }, { replace: true });
    }

    // if the ?continue query param contains the same url as the page itself, remove the query param.
    // this guards against /welcome?continue=/welcome and /welcome?continue=/welcome/,
    // when accessing /welcome directly on first app load
    if (to.query.continue && (to.path === to.query.continue || to.path + "/" === to.query.continue)) {
        return goToRoute(to.path, { replace: true });
    }
});
