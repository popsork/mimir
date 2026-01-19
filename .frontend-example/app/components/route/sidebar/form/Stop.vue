<template lang="pug">
.route-stop(
    v-if="routeStop"
    :data-id="routeStop.id"
    :data-status="planningStatus"
    :class="{ 'has-error': !routeStop.hasCoordinates() }"
    class="sorting-handle"
)
    .actions
        GenericButton(
            :title="$t('route.actions.Change order')"
            class="sorting-handle"
            type="alternative-ghost"
            size="small"
            icon="hamburger"
        )
    .info
        .name {{ stopName }}
        .additional
            .city {{ stopCity }}
            .estimated-arrival(v-if="stopIsPlanned")
                template(v-if="calculatingDrivingTime")
                    WaitingIndicator
                template(v-else)
                    template(v-if="editingEstimatedArrival")
                        FormDateField(
                            v-if="editingEstimatedArrival"
                            v-model="routeStop.estimatedArrivalAt"
                            name="estimated-arrival"
                            type="datetime"
                            :label="$t('route.fields.Estimated arrival')"
                            v-on:change="updateDrivingTime"
                        )
                    template(v-else)
                        button(type="button" data-name="edit" v-on:click="editEstimatedArrival") {{ estimatedArrivalText }}

    RouteStopType(:route-stop="routeStop")
    .actions
        GenericButton(
            :title="$t('route.actions.Remove stop')"
            class="remove-trigger"
            type="alternative-ghost"
            size="small"
            icon="cross"
            v-on:click="showRemovalDialog"
        )
    ConfirmationDialog(
        v-model:show="shouldShowRemovalDialog"
        :confirm-button-text="$t('general.Confirm')"
        :message="stopDescription"
        :title="$t('route.actions.Remove stop')"
        :auto-close-on-confirm="true"
        v-on:confirm="removeStop"
    )
        template(v-slot:additional-content)
            p {{ confirmationMessageText }}
</template>
<script setup lang="ts">
const props = defineProps<{
    routeStopId: string,
}>();

const store = useRouteFormRouteStopsStore();
const { t } = useI18n();

const editingEstimatedArrival = ref(false);
const editEstimatedArrival = () => {
    editingEstimatedArrival.value = true;
};
const stopEditingEstimatedArrival = () => {
    editingEstimatedArrival.value = false;
};

const shouldShowRemovalDialog = ref(false);
const showRemovalDialog = () => {
    shouldShowRemovalDialog.value = true;
};


const routeStop = computed(() => {
    return store.getRouteStopById(props.routeStopId);
});

const stopName = computed(() => {
    return routeStop.value?.name || t("route.Untitled stop");
});

const stopCity = computed(() => {
    return routeStop.value?.city || t("route.Unknown city");
});

const stopDescription = computed(() => {
    return `${stopName.value}, ${stopCity.value}`;
});

const estimatedArrivalText = computed(() => {
    return formatSystemTimeZoneTime(routeStop.value?.estimatedArrivalAt ?? null, { includeDate: false });
});

const confirmationMessageText = computed(() => {
    return routeStop.value?.transportOrderId
        ? t("route.messages.Both pickup and delivery of this order will be removed")
        : t("route.messages.This single stop will be removed");
});

const stopIsPlanned = computed(() => {
    return routeStop.value?.isPlanned;
});

const planningStatus = computed(() => {
    return stopIsPlanned.value ? "planned" : "unplanned";
});

const removeStop = () => {
    if (!routeStop.value) {
        return;
    }

    if (routeStop.value.transportOrderId) {
        store.removeRouteStopsByTransportOrderId(routeStop.value.transportOrderId);
        return;
    }

    store.removeRouteStopById(routeStop.value.id);
};


const updateDrivingTime = () => {
    // when a stop's estimated arrival is manually changed, its driving time needs to be recalculated
    // based on the previous stop's estimated arrival and handling time, so that the times match up correctly

    const stopIndex = store.plannedRouteStopIds.indexOf(routeStop.value!.id);
    const previousStop = stopIndex > 0
        ? store.getRouteStopById(store.plannedRouteStopIds[stopIndex - 1]!)
        : null;

    const previousStopArrival = previousStop?.estimatedArrivalAt ?? null;
    const previousStopHandlingTime = previousStop?.handlingTimeInMinutes ?? 0;
    const currentStopArrival = routeStop.value!.estimatedArrivalAt ?? null;

    const arrivalDifference = getTimeDifferenceInMinutes(currentStopArrival, previousStopArrival) ?? 0;

    let drivingTimeInMinutes = arrivalDifference - previousStopHandlingTime;
    if (drivingTimeInMinutes < 0) {
        drivingTimeInMinutes = 0;
    }

    routeStop.value!.drivingTimeInMinutes = drivingTimeInMinutes;
    store.recalculateEstimatedArrivals();
    stopEditingEstimatedArrival();
};

const waitStore = useWaitStore();
const calculatingDrivingTime = computed(() => {
    return waitStore.is(WaitingFor.RouteDrivingTimeCalculation);
});

</script>
<style scoped lang="scss">
.route-stop {
    @include small-text;

    position: relative;
    display: flex;
    align-items: center;
    border-radius: $element-border-radius;
    padding: steps(1);
    gap: steps(1);

    border: 1px solid $color-border-normal;
    &.has-error {
        border-color: $color-background-error;
        background-color: $color-background-error-lighter;
    }

    &[data-status="planned"] {
        background-color: $color-background-darker;
        &.has-error {
            background-color: $color-background-error;
        }
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;

        .remove-trigger {
            color: $color-text-lightest;
        }
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: steps(0.5);
        flex: 1;

        .name {
            @include normal-medium-text;
        }

        .additional {
            @include normal-text;
            display: flex;
            flex-direction: row;
            gap: steps(0.5);

            .city {
                flex-basis: 85%;
            }

            .estimated-arrival {
                flex-basis: 15%;

                button[data-name="edit"] {
                    @include clickable-button;
                    text-decoration: underline;
                    text-decoration-style: dashed;
                }

                .field[data-name="estimated-arrival"] {
                    width: steps(18);
                }

                .waiting-indicator {
                    height: steps(2);

                    &:deep(.svg svg) {
                        width: steps(1.5);
                        height: steps(1.5);
                        color: $color-text-lightest;
                    }
                }
            }
        }
    }


    &[data-status="unplanned"] {
        .info {
            .additional {
                color: $color-text-lightest;
            }
        }
    }
}
</style>
