import type { RouteRecordName } from "vue-router";

export function isRouteNameLocalized(routeName: RouteRecordName | string) {
    return !!String(routeName).match(ROUTE_NAME_LOCALIZATION_SUFFIX_PATTERN);
}
