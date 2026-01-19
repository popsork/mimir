<template lang="pug">
.tab(:data-name="props.name" :class="classNames")
    NuxtLink(:to="targetRoute" :replace="true")
        p.title
            slot(name="title")
        p.summary(v-if="$slots.summary")
            slot(name="summary")
</template>
<script setup lang="ts">

const props = defineProps<{
    name: string,
    hasErrors?: boolean,
}>();

const slots = useSlots();

const route = useRoute();

const targetRoute = computed(() => {
    return {
        name: route.name,
        params: {
            ...route.params,
            tab: props.name
        }
    };
});

const classNames = computed(() => {
    return {
        active: route.params.tab === props.name,
        "has-summary": !!slots.summary,

        // highlight order form tab if it has internal validation errors.
        // this is important during dry runs, because missing mandatory fields in a closed form tab
        // may prevent the whole order calculation from being processed,
        // and if the user is working in another tab, he might not see why nothing is being recalculated there.

        // this is not ideal and should probably be improved in the future,
        // (this also does not show that a required field is missing in the main header section)
        // but for now at least it indicates that something is wrong inside a closed tab.
        "has-errors": !!props.hasErrors
    };
});


</script>
<style scoped lang="scss">
.tab {
    background: $color-background-light;

    border-radius: $element-border-radius $element-border-radius 0 0;

    a {
        display: flex;
        flex-direction: column;
        text-decoration: none;
        padding: 0 steps(1.5) steps(0.5);
        height: steps(5.5);
        justify-content: center;
    }

    .title {
        @include normal-medium-text;
        margin-top: 3px;
        color: $color-text-lighter;
    }

    &:not(.has-summary) .title {
        margin-bottom: steps(2);
    }

    .summary {
        @include normal-text;
        color: $color-text-lightest;
    }

    &:hover:not(.active) {
        background: $color-background-darker;
    }

    &.active {
        background: $color-background-inverted;

        .title,
        .summary {
            color: $color-text-inverted;
        }
    }

    &.has-errors:not(.active) {
        background: $color-background-danger-lighter;

        &:hover {
            background: $color-background-danger;
        }
    }

}
</style>
