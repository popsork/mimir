import type { NavigateToOptions } from "nuxt/dist/app/composables/router";
import type { LocationQueryRaw, RouteParamsRaw, RouteRecordName } from "vue-router";

type RouteTo = {
    name?: string | RouteRecordName,
    path?: string,
    params?: RouteParamsRaw,
    query?: LocationQueryRaw,
    hash?: string,
};

export function goToRoute(to: string | RouteTo, options?: NavigateToOptions | undefined) {
    // "to" can be either a path (beginning with "/"), a route name or a RouteTo object
    const target = localizeNamedRouteIfNeeded(to);
    return navigateTo(target, options);
}

function routeNameExists(name: string): boolean {
    return useRouter().hasRoute(name);
}

function localizeNamedRouteIfNeeded(to: string | RouteTo) {
    let result: string | RouteTo;
    let routeName = getRouteName(to);

    if (routeName) {
        if (!routeNameExists(routeName) && !isRouteNameLocalized(routeName)) {
            routeName = localizeRouteName(routeName);
        }

        if (typeof to === "string") {
            result = { name: routeName };
        } else {
            result = Object.assign({}, to, { name: routeName });
        }
    } else {
        // for when "to" is a path beginning with "/" instead of a named route
        result = to;
    }
    return result;
}

function getRouteName(to: string | RouteTo): string | undefined {
    let routeName = undefined as string | undefined;

    if (typeof to === "string") {
        if (to.substring(0, 1) !== "/") {
            routeName = to;
        }
    } else if (to && to.name) {
        routeName = to.name as string;
    }
    return routeName;
}

function localizeRouteName(routeName: RouteRecordName | string, locale?: SiteLocale) {
    if (!locale) {
        locale = getCurrentLocale();
    }
    return `${String(routeName)}___${locale}`;
}
