<template lang="pug">
.calendar(:id="containerId" ref="container" :class="{ 'header-only': headerOnly }" :data-unit-id="unitId")
</template>
<script setup lang="ts">
import { h } from "vue";

import { add, format } from "date-fns";
import OrdersCalendarItemOrderContent from "~/components/orders/calendar/item/order/Content.vue";
import OrdersCalendarItemBlockedTimePeriodContent from "~/components/orders/calendar/item/blocked-time-period/Content.vue";
import OrdersCalendarItemNewContent from "~/components/orders/calendar/item/new-item/Content.vue";

import { createCalendar, destroyCalendar, Interaction, TimeGrid } from "@event-calendar/core";

const props = defineProps<{
    unitId?: string,
}>();

const headerOnly = computed(() => { return !props.unitId });

const title = computed(() => {
    return `Unit ${props.unitId}`;
});

const containerId = computed(() => {
    const id = (headerOnly.value) ? "header" : props.unitId;
    return `calendar-${id}`;
});

const container = useTemplateRef("container");

const { mountComponent } = useComponentMounting(container);

const calendarStore = useOrdersCalendarStore();

const parametersStore = useOrdersCalendarParametersStore();

const { firstDate, numberOfDays, firstHour, lastHour } = storeToRefs(parametersStore);

const refreshCalendarOnNextTick = () => {
    nextTick(() => {
        if (calendar) {
            calendar.refetchEvents();
        }
    });
};
const ordersStore = useOrdersCalendarOrdersStore();
const { loadedOrders } = storeToRefs(ordersStore);

const blockedTimePeriodsStore = useOrdersCalendarBlockedTimePeriodsStore();
const { loadedBlockedTimePeriods } = storeToRefs(blockedTimePeriodsStore);

watch(
    [loadedOrders, loadedBlockedTimePeriods],
    refreshCalendarOnNextTick,
    { deep: true, immediate: true }
);


// CalendarItem is what is called an "event" in the calendar library
type CalendarItem = {
    id: string,
    start: Date,
    end: Date,
    color: string,
    classNames?: string[],
    extendedProps: {
        itemType: CalendarItemType,
        resourceId: string,
        unitId: string,
    },
};

// these types are objects that get passed to various callbacks by the calendar library (called "info" in their docs)
// and most contain an "event" property and various other things depending on the specific callback
type CalendarInfo = {
    event: CalendarItem,
};

type CalendarChangeInfo = {
    event: CalendarItem,
    oldEvent: CalendarItem,
};

type CalendarMouseEvent = {
    event: CalendarItem,
    jsEvent: MouseEvent,
};

type CalendarNewItemInfo = {
    start: Date,
    end: Date,
    jsEvent: MouseEvent,
};


const getOrderItems = () => {
    if (!props.unitId) {
        return [];
    }
    const orders = ordersStore.getRecordsForUnit(props.unitId);

    const result = orders.map((order) => {
        const itemStart = getSystemTimeZoneDate(order.startsAt)!;
        let itemEnd = getSystemTimeZoneDate(order.endsAt)!;

        // for some reason the calendar component does not display items
        // that both start and end at 00:00 on the same date (matching times later in the day work fine)
        // so for this case just add 1 minute to the end time.
        // this does not affect the item's data, e.g. the tooltip content, just the displayed box in the calendar

        // use formatted string comparison to discard seconds and milliseconds
        const formattedStart = format(itemStart, "yyyy-MM-dd HH:mm");
        const formattedEnd = format(itemEnd, "yyyy-MM-dd HH:mm");
        const startsAtMidnight = (format(itemStart, "HH:mm") === "00:00");

        if (formattedStart === formattedEnd && startsAtMidnight) {
            itemEnd = add(itemEnd, { minutes: 1 });
        }

        // another edge case is when the item ends before it starts.
        // in those cases, the calendar also does not display the item at all.
        // normally it should not be possible, but there is a requirement that if this somehow happens,
        // the item should still show up in calendar at its start time anyway,
        // so just set the end time to 1 minute after the start time
        if (formattedStart > formattedEnd) {
            itemEnd = add(itemStart, { minutes: 1 });
        }

        return {
            id: `ORDER-${order.id}`, // scope calendar event ids with a prefix based on item type
            start: itemStart,
            end: itemEnd,
            color: getOrderStatusColor(order.status),
            extendedProps: {
                itemType: CalendarItemType.Order,
                resourceId: order.id,
                unitId: props.unitId
            }
        } as CalendarItem;
    });
    return result;
};


const getBlockedTimePeriodItems = () => {
    if (!props.unitId) {
        return [];
    }
    const blockedTimePeriods = blockedTimePeriodsStore.getRecordsForUnit(props.unitId);

    const result = blockedTimePeriods.map((blockedTimePeriod) => {
        return {
            id: `BLOCK-${blockedTimePeriod.id}`, // scope calendar item ids with a prefix based on item type
            start: getSystemTimeZoneDate(blockedTimePeriod.startsAt),
            end: getSystemTimeZoneDate(blockedTimePeriod.endsAt),
            color: getBlockedTimePeriodItemColor(),
            extendedProps: {
                itemType: CalendarItemType.BlockedTimePeriod,
                resourceId: blockedTimePeriod.id,
                unitId: props.unitId
            }
        } as CalendarItem;
    });
    return result;
};

const getBlockedTimePeriodItemColor = () => {
    return "#DADCE1"; // $color-background-calendar-blocked-time-period
};

const getItemContent = (info: CalendarInfo) => {
    const item = info.event;

    if (item.id === "{select}") {
        return getNewItemContent(item);
    }

    if (item.extendedProps.itemType === CalendarItemType.Order) {
        return getOrderItemContent(item);
    }

    if (item.extendedProps.itemType === CalendarItemType.BlockedTimePeriod) {
        return getBlockedTimePeriodItemContent(item);
    }

    return null;
};



const getNewItemContent = (item: CalendarItem) => {
    const component = {
        setup: () => () => h(OrdersCalendarItemNewContent)
    };

    const { el } = mountComponent(component, {
        props: {
            start: convertCalendarTimeToSystemTime(item.start),
            end: convertCalendarTimeToSystemTime(item.end)
        },
    });

    return {
        domNodes: [el]
    };
};

const getOrderItemContent = (item: CalendarItem) => {
    const orderId = item.extendedProps.resourceId;

    const component = {
        setup: () => () => h(OrdersCalendarItemOrderContent)
    };
    const { el } = mountComponent(component, {
        props: { itemId: item.id, orderId },
    });

    return {
        domNodes: [el]
    };
};

const getBlockedTimePeriodItemContent = (item: CalendarItem) => {
    const blockedTimePeriodId = item.extendedProps.resourceId;

    const component = {
        setup: () => () => h(OrdersCalendarItemBlockedTimePeriodContent)
    };

    const { el } = mountComponent(component, {
        props: { itemId: item.id, blockedTimePeriodId },
    });

    return {
        domNodes: [el]
    };
};

const mouseEnterTimers = {} as Record<string, NodeJS.Timeout>;

const getInteractionItem = (item: CalendarItem, segmentIndex: number | null): CalendarInteractionItem => {
    const { unitId, resourceId, itemType } = item.extendedProps;
    return { itemId: item.id, unitId, resourceId, itemType, segmentIndex };
};

const getNewItemIneractionItem = (info: CalendarNewItemInfo): CalendarInteractionItem | null => {
    if (!props.unitId) {
        return null;
    }

    return {
        unitId: props.unitId,
        itemId: null,
        itemType: CalendarItemType.NewItem,
        resourceId: null,
        segmentIndex: null,
        start: convertCalendarTimeToSystemTime(info.start),
        end: convertCalendarTimeToSystemTime(info.end)
    };
};

const showItemHint = (item: CalendarItem, segmentIndex: number | null) => {
    calendarStore.activateHint(getInteractionItem(item, segmentIndex));
};

const showItemHintAfterAWhile = (item: CalendarItem, segmentIndex: number | null) => {
    mouseEnterTimers[item.id] = setTimeout(() => {
        showItemHint(item, segmentIndex);
    }, 500);
};

const hideItemHint = (item: CalendarItem, segmentIndex: number | null) => {
    clearTimeout(mouseEnterTimers[item.id]);
    calendarStore.deactivateHint(getInteractionItem(item, segmentIndex));
};

const hideAllItemHints = () => {
    // this hides any visible hint and stops any pending hints from showing
    Object.keys(mouseEnterTimers).forEach((key) => {
        clearTimeout(mouseEnterTimers[key]);
    });
    calendarStore.deactivateHint();
};

const toggleItemMenu = (item: CalendarItem, segmentIndex: number | null) => {
    calendarStore.toggleMenu(getInteractionItem(item, segmentIndex));
};

const hideAllItemMenus = () => {
    calendarStore.deactivateMenu();
};
useCallbackOnEscape(() => {
    hideAllItemMenus();
});

const convertCalendarTimeToSystemTime = (input: Date) => {
    // all Date objects coming from the calendar component are always in the browser's timezone,
    // because the calendar library does not support timezones,
    // so "7:00" in the visual calendar grid always means 7:00 in the browser's timezone.

    // but it actually needs to mean 7:00 in the defined system's timezone instead.
    return transposeBrowserTimeToSystemTime(input);
};

const updateItemTimes = (item: CalendarItem, oldItem: CalendarItem) => {
    const itemType = item.extendedProps.itemType;

    // even though the calendar component snaps the items to grid when moving or resizing,
    // it does not actually snap the values,
    // e.g., if an item ends at 11:48, and the user drags the end to 13:00, it visually snaps to 13:00,
    // but the value gets set to 12:48 instead.
    // to work around this, we need to explicitly round the values to the nearest half-hour

    const startChanged = (item.start.toISOString() !== oldItem.start.toISOString());
    const start = (startChanged) ? roundToNearestHalfHour(item.start) : item.start;

    const endChanged = (item.end.toISOString() !== oldItem.end.toISOString());
    const end = (endChanged) ? roundToNearestHalfHour(item.end) : item.end;

    const tzStart = convertCalendarTimeToSystemTime(start);
    const tzEnd = convertCalendarTimeToSystemTime(end);

    const updateArguments = {
        id: item.extendedProps.resourceId,
        startsAt: getUtcDatetimeString(tzStart)!,
        endsAt: getUtcDatetimeString(tzEnd)!
    };

    if (itemType === CalendarItemType.Order) {
        ordersStore.updateRecordTimes(updateArguments);
    } else if (itemType === CalendarItemType.BlockedTimePeriod) {
        blockedTimePeriodsStore.updateRecordTimes(updateArguments);
    }
    refreshCalendarOnNextTick();
};

const roundToNearestHalfHour = (date: Date) => {
    const halfHourInMs = 30 * 60 * 1000;
    const roundedTime = Math.round(date.getTime() / halfHourInMs) * halfHourInMs;
    return new Date(roundedTime);
};

const orderAttributesStore = useOrdersCalendarOrderAttributesStore();

const { selectedAttributes: selectedOrderAttributes } = storeToRefs(orderAttributesStore);

watch(selectedOrderAttributes, refreshCalendarOnNextTick);


const clearNewItemSelection = () => {
    if (calendar) {
        calendar.unselect();
    }
};

const { menu } = storeToRefs(calendarStore);

watch(menu, (newMenu) => {
    if (!newMenu.unitId) {
        clearNewItemSelection();
    }
});


// calendar library callbacks
const handleEventMouseEnter = (info: CalendarMouseEvent) => {
    if (calendar) {
        const item = info.event;
        if (!item.classNames || !item.classNames.includes("hovered")) {
            item.classNames = ["hovered"];
            calendar.updateEvent(item);
        }
    }
    const segmentIndex = getItemSegmentIndex(info);
    hideAllItemHints();
    showItemHintAfterAWhile(info.event, segmentIndex);
};

const handleEventMouseLeave = (info: CalendarMouseEvent) => {
    if (calendar) {
        const item = info.event;
        if (item.classNames) {
            delete item.classNames;
            calendar.updateEvent(item);
        }
    }
    const segmentIndex = getItemSegmentIndex(info);
    hideItemHint(info.event, segmentIndex);
};

const handleEventClick = (info: CalendarMouseEvent) => {
    const segmentIndex = getItemSegmentIndex(info);
    hideAllItemHints();
    toggleItemMenu(info.event, segmentIndex);
};

const handleEventDragStart = () => {
    hideAllItemHints();
    hideAllItemMenus();
};

const handleEventResizeStart = () => {
    hideAllItemHints();
    hideAllItemMenus();
};

const handleEventDrop = (info: CalendarChangeInfo) => {
    updateItemTimes(info.event, info.oldEvent);
};

const handleEventResize = (info: CalendarChangeInfo) => {
    updateItemTimes(info.event, info.oldEvent);
};

const handleNewItemSelection = (info: CalendarNewItemInfo) => {
    hideAllItemHints();
    hideAllItemMenus();

    const interactionItem = getNewItemIneractionItem(info);
    if (!interactionItem) {
        clearNewItemSelection();
        return;
    }
    calendarStore.activateMenu(interactionItem);
};



const getCalendarSelector = (unitId: string) => {
    return `.calendar[data-unit-id='${CSS.escape(unitId)}']`;
};

const getItemSegmentIndex = (info: CalendarMouseEvent) => {
    // there may be multiple nodes/segments for a single item if it spans multiple days
    const unitId = info.event.extendedProps.unitId;
    const itemId = info.event.id;

    const contentSelector = `${getCalendarSelector(unitId)} .item-content[data-item-id='${CSS.escape(itemId)}']`;

    const contentNodes = document.querySelectorAll(contentSelector);

    const target = info.jsEvent.target;
    if (!(target instanceof HTMLElement)) {
        return null;
    }
    const itemNode = target.closest("article.ec-event");
    if (!itemNode) {
        return null;
    }
    const contentNode = itemNode.querySelector(contentSelector);
    if (!contentNode) {
        return null;
    }

    const index = [...contentNodes].indexOf(contentNode);
    if (index === -1) {
        return null;
    }
    return index;
};

let calendar: any;

const date = computed(() => {
    return firstDate.value;
});
const duration = computed(() => {
    return { days: numberOfDays.value };
});
const slotMinTime = computed(() => {
    if (headerOnly.value) {
        return "00:00";
    }
    return `${firstHour.value.toString().padStart(2, "0")}:00`;
});
const slotMaxTime = computed(() => {
    if (headerOnly.value) {
        return "00:00";
    }
    return `${(lastHour.value + 1).toString().padStart(2, "0")}:00`;
});
watch([firstDate, numberOfDays, firstHour, lastHour], () => {
    if (!calendar) {
        return;
    }

    calendar.setOption("date", date.value);
    calendar.setOption("duration", duration.value);
    calendar.setOption("slotMinTime", slotMinTime.value);
    calendar.setOption("slotMaxTime", slotMaxTime.value);
}, { deep: true });


const { locale } = useI18n();

watch(locale, (newLocale) => {
    if (!calendar) {
        return;
    }
    calendar.setOption("locale", newLocale);
});


const initializeCalendar = () => {
    if (!container.value) {
        return;
    }
    calendar = createCalendar(
        container.value,
        [TimeGrid, Interaction],
        {
            view: "timeGridDay",
            allDaySlot: false,
            dragScroll: true,
            editable: true,
            slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: false },
            slotEventOverlap: false,
            selectable: true,
            slotHeight: 10, // half-hour height. must match .ec-time, .ec-line height in styles
            locale: locale.value,
            firstDay: 1,
            date: date.value,

            duration: duration.value,
            slotMinTime: slotMinTime.value,
            slotMaxTime: slotMaxTime.value,
            eventBackgroundColor: getBlockedTimePeriodItemColor(),
            selectBackgroundColor: getBlockedTimePeriodItemColor(),

            eventSources: [
                { events: getOrderItems },
                { events: getBlockedTimePeriodItems }
            ],

            titleFormat: () => title.value,

            headerToolbar: { start: "", center: "", end: "" },
            dayHeaderFormat: { weekday: "short", day: "numeric", month: "short", year: "numeric" },

            unselectAuto: true,
            unselectCancel: ".new-item-menu",

            eventContent: getItemContent,

            eventClick: handleEventClick,
            eventMouseEnter: handleEventMouseEnter,
            eventMouseLeave: handleEventMouseLeave,
            eventDragStart: handleEventDragStart,
            eventResizeStart: handleEventResizeStart,
            eventResize: handleEventResize,
            eventDrop: handleEventDrop,
            select: handleNewItemSelection
        }
    );
};

onMounted(() => {
    if (!calendar) {
        initializeCalendar();
    }
});

onBeforeUnmount(() => {
    hideAllItemHints();
    hideAllItemMenus();
    if (calendar) {
        destroyCalendar(calendar);
        calendar = null;
    }
});

</script>
<style scoped lang="scss">
.calendar {

    &:deep(.ec-time-grid) {
        --ec-border-color: #{$color-border-normal};

        .ec-toolbar {
            display: none;
        }

        .ec-header {
            height: steps(4);
            border-color: transparent; // to avoid misalignment between calendars, the border should stay but be invisible

            .ec-day {
                height: steps(4);
                display: flex;
                align-items: center;
                justify-content: center;
                @include normal-strong-text;
            }
        }

        .ec-time,
        .ec-line {
            height: 10px; // half-hour height. must match slotHeight in calendar options above
        }

        .ec-header,
        .ec-body {
            .ec-sidebar {
                width: steps(5);
            }
        }

        .ec-body {
            background: $color-background-lighter;
            overflow-y: hidden;

            .ec-sidebar {
                overflow: hidden;

                .ec-time {
                    @include small-medium-text;
                    color: $color-text-lightest;
                    transform: translateY(steps(0.5));
                }
            }

            .ec-events .ec-event {
                @include normal-medium-text;
                color: $color-text-lighter;
                border-radius: $element-border-radius-small;
                border: 1px solid $color-background-lighter;

                &.ec-preview {
                    opacity: 1;
                }

                &.hovered {
                    &::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        // make hovered items slightly darker
                        background: rgba(0, 0, 0, 0.08);
                        pointer-events: none;
                        z-index: -1;
                    }
                }
            }

            .ec-event-body {
                overflow-y: hidden;
                justify-content: center;
            }

        }

        .ec-body:not(.ec-compact) .ec-line:nth-child(2n)::after {
            border-bottom-style: none;
        }

        .ec-day.ec-today {
            background: none;
        }

    }

    &.header-only {
        &:deep(.ec-time-grid) {
            .ec-body {
                display: none;
            }
        }
    }
    &:not(.header-only) {
        &:deep(.ec-time-grid) {
            .ec-header {
                display: none; // hide date headers from all calendars except the extra header-only one
            }
        }
    }

}
</style>
