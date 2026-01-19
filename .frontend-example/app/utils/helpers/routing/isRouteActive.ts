import type { RouteLocationNamedRaw, RouteLocationNormalizedLoaded } from "vue-router";

export function isRouteActive(to: RouteLocationNamedRaw, currentRoute: RouteLocationNormalizedLoaded) {
    // nuxt's built-in router-link-active class mechanism does not work in all scenarios,
    // so add support for custom route matching logic via activeTopLevelRouteName/activeSecondLevelRouteName in a page's metadata
    // to mark which link should be active in the menu

    // currentRoute needs to be passed as an argument
    // because using useRoute() directly in here causes nuxt to throw warnings about using it inside a middleware
    // when switching languages

    if (!to.name) {
        // this detection only supports routes passed as objects with a name,
        // because it uses names of routes for matching
        return false;
    }

    const router = useRouter();
    const linkRoute = router.resolve(to);
    if (!linkRoute) {
        return false;
    }

    const linkRouteDepth = linkRoute.path.split("/").filter(Boolean).length;

    if (linkRouteDepth === 1 && currentRoute.meta.activeTopLevelRouteName) {
        return linkRoute.name === currentRoute.meta.activeTopLevelRouteName;
    }

    if (linkRouteDepth === 2 && currentRoute.meta.activeSecondLevelRouteName) {
        return linkRoute.name === currentRoute.meta.activeSecondLevelRouteName;
    }

    // no custom logic, fall back to vue-router functionality
    const link = useLink({ to });

    return link.isActive.value;
}
