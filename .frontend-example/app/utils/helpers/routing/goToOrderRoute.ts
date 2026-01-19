import type { NavigateToOptions } from "nuxt/dist/app/composables/router";

export function goToOrderRoute({ id, tab }: { id: string, tab?: OrderFormTabName }, options?: NavigateToOptions) {
    goToRoute(getOrderRoute({ id, tab }), options);
}
