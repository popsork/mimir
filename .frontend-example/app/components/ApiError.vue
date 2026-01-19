<template lang="pug">
.api-error.overlay
    .error.dialog(role="dialog" :data-production="isProduction")
        p.message {{ $t("general.error.Something has gone wrong") }}
        p.trigger
            button.details(type="button" v-on:click="toggleDetails") {{ $t(buttonTranslation) }}
        p.details(v-if="showDetails")
            textarea(:value="errorDetails" readonly)
        p.actions
            GenericButton(type="primary" size="medium" v-on:click="close") {{ $t("general.Close") }}
</template>
<script setup lang="ts">
const apiStore = useApiStore();
const error = computed(() => apiStore.error);

const config = useConfiguration();

const isProduction = (config.environment && config.environment.includes("production")) ? "true" : "false";


const showDetails = ref(false);
const errorDetails = computed(() => {
    const parts = [] as Array<string>;
    parts.push(JSON.stringify(error.value));
    if (error.value.response) {
        parts.push("Response: " + JSON.stringify(error.value.response));
    }
    return parts.join("\n");
});

const buttonTranslation = computed(() => {
    const key = (showDetails.value) ? "Hide technical details" : "Show technical details";
    return `general.error.${key}`;
});
const toggleDetails = () => {
    showDetails.value = !showDetails.value;
};
const close = () => {
    apiStore.clearError();
};
</script>
<style scoped lang="scss">
.overlay {
    @include overlay;
    background: $color-background-translucent;

    .dialog {
        position: relative;

        width: steps(60);
        max-width: 90vw;
        margin: steps(3) auto;
        padding: steps(1);
        border-radius: $dialog-border-radius;
        text-align: center;

        @include dialog-shadow;

        background: $color-background-lightest;

        .actions {
            display: flex;
            margin: steps(1) steps(-0.5) 0;

            button {
                flex-grow: 1;
                margin: 0 steps(0.5);
            }
        }

        .message {
            @include small-heading;
            margin-bottom: steps(1);
        }

        button.details {
            @include link-decoration;
            font-weight: normal;
            margin-bottom: steps(1);
        }

        .details textarea {
            @include small-text;

            padding: 0 steps(0.5);
            height: steps(20);
            user-select: text;
            pointer-events: all;
            resize: none;
        }

        .actions {
            max-width: steps(20);
            margin: steps(2) auto 0;
        }

        &[data-production="true"] {

            .trigger,
            .details {
                display: none;
            }
        }

    }
}
</style>

