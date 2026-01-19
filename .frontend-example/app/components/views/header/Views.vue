<template lang="pug">
ul.views(ref="header")
    li(v-for="link in links" :key="link.to.name" :data-name="link.to.name")
        NuxtLink(:to="link.to" :class="link.classes" :style="link.style" :title="link.title")
            span {{ link.text }}
</template>
<script setup lang="ts">
type LinkableView = {
    id: string,
    shortcut: string | null,
    tabBackgroundColor: string | null,
    name: string,
    isSticky: boolean,
    type: ViewType,
};

const props = defineProps<{
    routeName: string,
    views: LinkableView[],
}>();

const goToView = (view: LinkableView) => {
    goToRoute({
        name: props.routeName,
        query: {
            view: view.id
        }
    });
};

const viewShortcuts = computed(() => {
    const shortcuts = {} as ShortcutMap;
    for (const view of props.views) {
        if (!view.shortcut || view.type === ViewType.Default || view.isSticky) {
            continue;
        }

        shortcuts[view.shortcut] = () => goToView(view);
    }

    return shortcuts;
});

useKeyboardShortcuts(viewShortcuts);

const getViewLinkStyle = (view: LinkableView) => {
    if (!view.tabBackgroundColor) {
        return {};
    }

    return {
        "--tab-background-color": view.tabBackgroundColor,
    };
};

const getViewTitle = (view: LinkableView) => {
    return view.shortcut;
};

const route = useRoute();
const links = computed(() => {
    return props.views.map(view => ({
        to: {
            name: props.routeName,
            query: {
                view: view.id
            }
        },
        text: view.name,
        classes: {
            active: route.query.view === view.id,
            "custom-color": !!view.tabBackgroundColor,
        },
        style: getViewLinkStyle(view),
        title: getViewTitle(view),
    }));
});

useElementHeightTracking("viewsHeader", useTemplateRef("header"));

</script>
<style scoped lang="scss">
.views {
    --tab-background-color: #{$color-background-light};

    height: steps(4.5);
    @include block-list;
    @include content-padding;
    @include normal-medium-text;

    border-bottom: 1px solid $color-border-normal;
    background-color: $color-background-lightest;
    z-index: 11;
    position: relative;

    display: flex;
    padding-top: steps(1);
    gap: steps(0.5); // design specifies 6px, but I rounded to 0.5 steps (~ 4px)

    li {
        a {
            @include tab;

            height: 100%;

            background-color: var(--tab-background-color);
            color: $color-text-normal;


            &:hover:not(.active) {
                background-color: $color-background-darker;

                &.custom-color {
                    // make any background color slightly darker on hover
                    background-color: color-mix(in srgb, var(--tab-background-color), $color-darken 8%);
                }
            }

            &.active {
                background-color: $color-background-inverted;
                color: $color-text-inverted;
            }

            &:deep(.svg) {
                margin-right: steps(0.5);
            }
        }
    }
}
</style>
