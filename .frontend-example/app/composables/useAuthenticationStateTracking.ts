export const useAuthenticationStateTracking = () => {
    const authenticationStore = useAuthenticationStore();
    const userAuthenticationState = computed(() => authenticationStore.userAuthenticationState);
    const route = useRoute();

    watch(userAuthenticationState, (authenticated, previouslyAuthenticated) => {
        // when authentication state changes, redirect to root to retrigger navigation guards
        // or to the given continue url if it is set in query

        if (route.query.continue) {
            goToRoute(String(route.query.continue));
        } else {
            let continueArg;
            if (!authenticated && previouslyAuthenticated === undefined && route.meta.anonymousAccess) {
                // if detecting that the user is not authenticated, and the route allows anonymous access,
                // go directly to that route instead of index with continueArg
                return goToRoute(route.fullPath);
            }

            if (!authenticated && previouslyAuthenticated) {
                // if changing from authenticated to unauthenticated, do a full page reload.
                // this in needed to prevent leaking of any data inside any of the stores between different users.
                // resetting each existing store individually is not feasible, so it's better to just reload the app completely.
                window.location.reload();
                return;
            } else if (route.fullPath === "/") {
                // do not pass current path in continueArg if it is the root path
                continueArg = undefined;
            } else {
                // in all other cases pass the current path in continueArg
                continueArg = route.fullPath;
            }
            goToRoute({ name: "index", query: { continue: continueArg } }, { replace: true });
        }
    });
};

