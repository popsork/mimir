<template lang="pug">
.sidebar
    .actions
        .action
            GenericButton(
                class="sorting-handle"
                type="alternative-ghost"
                size="small"
                icon="hamburger"
                :title="t('orders.calendar.actions.Reorder units')"
            )
        .action
            GenericButton(
                class="remove"
                type="alternative-ghost"
                size="small"
                icon="cross"
                :title="t('orders.calendar.actions.Remove unit')"
                v-on:click="removeUnit"
            )
    .details(v-if="unit")
        p.name {{ unit.name }}
        h3.carrier {{ unit.carrierName }}
        .driver
            p.name {{ unit.driverName }}
            p.phone {{ unit.driverPhone }}
        .vehicle
            p.description {{ unit.vehicleDescription }}
            p.comment {{ unit.vehicleComment }}
</template>
<script setup lang="ts">
const props = defineProps<{
    unitId: string,
}>();

const { t } = useI18n();

const unitsStore = useOrdersCalendarUnitsStore();

const unit = computed(() => {
    return unitsStore.getUnitById(props.unitId);
});

const removeUnit = () => {
    unitsStore.removeUnit(props.unitId);
};
</script>
<style scoped lang="scss">
.sidebar {
    padding: 2px; // there is a weird 2px offset in the design for the sidebar, which does make a difference visually

    display: flex;
    align-items: flex-start;

    .actions {
        flex: 0 0 steps(5);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: steps(1);

        .action {
            height: steps(4);
            display: flex;
            align-items: center;
            justify-content: flex-start;

            .sorting-handle {
                cursor: move;
            }
        }
    }

    .details {
        flex: 1;
        @include word-break;

        padding: steps(0.5) steps(1) steps(0.5) 0;


        > .name {
            display: inline-flex;
            flex: 1 1 steps(5);
            min-width: steps(5);
            min-height: steps(3);
            align-items: center;
            justify-content: center;
            padding: 0 steps(1);
            margin-bottom: steps(0.5);

            border-radius: $element-border-radius-small;
            background: $color-background-darker;
            @include normal-strong-text;
        }

        .carrier {
            @include normal-strong-text;
            margin-bottom: steps(0.5);
        }

        .driver {
            margin-bottom: steps(0.5);

            .name,
            .phone {
                @include normal-medium-text;
            }
        }

        .vehicle {
            .description,
            .comment {
                @include normal-text;
                color: $color-text-lightest;
            }

            .description {
                margin-bottom: steps(0.5);
            }
        }


    }
}
</style>
