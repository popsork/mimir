import { mount } from "mount-vue-component";
import { MapCluster } from "#components";
import type { ClusterStats } from "@googlemaps/markerclusterer";

export const buildMapClusterContent = (props: { count: number, stats: ClusterStats }) => {
    const nuxtApp = useNuxtApp();
    const { el, destroy } = mount(MapCluster, { props, app: nuxtApp.vueApp });
    return { node: el, destructor: destroy as () => void };
};
