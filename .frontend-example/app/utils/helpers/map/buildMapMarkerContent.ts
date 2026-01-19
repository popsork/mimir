import { mount } from "mount-vue-component";
import { MapMarker } from "#components";

export const buildMapMarkerContent = (props: { label: string, color: string }) => {
    const nuxtApp = useNuxtApp();
    const { el, destroy } = mount(MapMarker, { props, app: nuxtApp.vueApp });
    return { node: el, destructor: destroy as () => void };
};
