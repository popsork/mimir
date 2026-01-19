<template lang="pug">
.field(
    ref="field"
    :data-name="name"
    :data-type="type"
    :data-layout="layout"
    :data-size="size"
    :class="classes"
    :title="title"
)
    FormFieldLabel(v-if="label && isLabelVisible" :text="label")
    PrimeDatePicker(
        ref="picker"
        v-bind="inputProps"
        v-model="internalValue"
        v-on:show="handleShow"
        v-on:hide="handleHide"
        v-on:keydown="handlePickerKeydown"
        v-on:date-select="handleDateSelect"
    )
        template(v-if="isInputIconVisible" v-slot:inputicon)
            SvgImage(name="calendar-with-dates")
        template(v-if="areActionsEnabled" v-slot:footer)
            .actions
                GenericButton(type="primary" size="small" v-on:click="confirmValueAndClose") {{ $t("general.Apply") }}
                GenericButton(type="tertiary" size="small" v-on:click="cancelValueAndClose") {{ $t("general.Cancel") }}
                GenericButton(type="tertiary" size="small" v-on:click="clearValueAndClose") {{ $t("general.Clear") }}
    .description(v-if="slots.description")
        slot(name="description")
    FormErrors(:errors="errors")
</template>
<script setup lang="ts">
import { add, format, startOfDay } from "date-fns";


// layout and size options and logic are the same as for text fields. see FormInputField component for comments

const props = withDefaults(defineProps<{
    name?: string,
    type?: "date" | "datetime" | "datetimerange",
    label?: string,
    labelVisible?: boolean,
    layout?: "loose" | "compact",
    size?: "medium" | "large",
    placeholder?: string,  // only shown in single value mode, not available in range
    disabled?: boolean,
    changed?: boolean,
    errors?: FormFieldError[],
    containerMode?: "normal" | "modal-dialog",
    minDate?: string | null,
    maxDate?: string | null,
}>(), {
    labelVisible: true,
    type: "date",
    layout: "loose",
    size: "medium",
    placeholder: "",
    disabled: false,
    changed: false,
    containerMode: "normal",
    minDate: null,
    maxDate: null,
});

const slots = useSlots();

// value model strings are expected (and emitted) in YYYY-MM-DD format for dates, and in ISO 8601 format as UTC for datetimes
const value = defineModel<string | [string, string] | [string, string] | null>();

// internal value is used for the PrimeVue DatePicker component, and it is not directly bound to the value model,
// as the picker component emits changes on each input, which we do not want,
// as an emitted value may immediately trigger some API calls in the form etc,
// when the user is, for example, still only adjusting the time part by clicking on the hour and minute arrows.
// therefore, the internal value gets explicitly loaded when the outer value changes,
// and gets emitted only when the user confirms the chosen value
const internalValue = ref<Date | [Date | null, Date | null] | null>(null);

const shouldAutoConfirmOnInternalValueChange = ref(false);

watch(internalValue, () => {
    if (shouldAutoConfirmOnInternalValueChange.value) {
        confirmValue();
        shouldAutoConfirmOnInternalValueChange.value = false;
    }
});

const loadValue = () => {
    internalValue.value = getValueForPicker();
};

const getValueForPicker = () => {
    if (!value.value) {
        return null;
    }

    if (Array.isArray(value.value)) {
        if (!value.value[0] || !value.value[1]) {
            return null;
        }
        const result = [
            convertModelValueToInternalValue(value.value[0]),
            convertModelValueToInternalValue(value.value[1])
        ];
        if (result[0] === null || result[1] === null) {
            return null;
        }
        return result as [Date, Date];
    }

    return convertModelValueToInternalValue(value.value);
};

const emitValue = () => {
    const newValue = internalValue.value;
    if (newValue === null) {
        value.value = null;
        emit("change");
        return;
    }

    if (Array.isArray(newValue)) {
        if (newValue[0] === null || newValue[1] === null) {
            value.value = null;
            emit("change");
            return;
        }
        value.value = [
            convertInternalValueToModelValue(newValue[0])!,
            convertInternalValueToModelValue(newValue[1])!
        ];
        emit("change");
        return;
    }

    value.value = convertInternalValueToModelValue(newValue);
    emit("change");
};

// the date picker component does not support time zones,
// so in order to display the value in the system's timezone,
// we need to force the picker into thinking that the time is actually in the browser's time zone,
// e.g., if a given UTC time is 00:00 which means 01:00 in system time and 02:00 in browser time,
// the picker needs to be tricked into believing that the value is 01:00 in browser time,
// in order for it to show the value in the UI as "01:00".
// afterwards, whatever value comes out of the picker, will be in browser time,
// and needs to be converted back to the correct system time value and returned in UTC
// e.g., when the picker emits 01:00 in browser time, it actually should mean 01:00 in system time,
// which gets then translated to UTC 00:00 (if system time is UTC+1)

const convertModelValueToInternalValue = (input: string) => {
    const inputTimeString = (props.type === "date") ? `${input}T00:00:00Z` : input;

    const systemTime = getSystemTimeZoneDate(inputTimeString);
    if (!systemTime) {
        return null;
    }

    const browserTime = transposeSystemTimeToBrowserTime(systemTime);
    return new Date(browserTime);
};

const convertInternalValueToModelValue = (input: Date) => {
    const browserTime = input;

    if (props.type === "date") {
        // the datepicker component emits dates as 00:00:00 in browser time,
        // so the date part can be used without transposing
        return format(browserTime, "yyyy-MM-dd");
    }

    // always force seconds to 0, except for the last minute of the hour, when they need to be 59
    if (browserTime.getMinutes() == 59) {
        browserTime.setSeconds(59);
    } else {
        browserTime.setSeconds(0);
    }
    // we are ignoring milliseconds, so always reset them to 0
    browserTime.setMilliseconds(0);

    const systemTime = transposeBrowserTimeToSystemTime(browserTime);
    return getUtcDatetimeString(systemTime);
};

watch(() => value.value, loadValue, { immediate: true });

const confirmValue = () => {
    emitValue();
};

const cancelValue = () => {
    loadValue();
};

const clearValue = () => {
    internalValue.value = (props.type === "datetimerange") ? [null, null] : null;
};

const confirmValueAndClose = () => {
    confirmValue();
    close();
};

const cancelValueAndClose = () => {
    cancelValue();
    close();
};

const clearValueAndClose = () => {
    clearValue();
    confirmValueAndClose();
};

const close = () => {
    if (!picker.value) {
        return;
    }
    // typescript does not recognize the exposed overlayVisible boolean prop
    // so we need to cast the picker ref to any to access it without warnings
    (picker.value as any).overlayVisible = false;
};


const handleShow = () => {
    // the datepicker component uses current time as the default, but we need the default to be 00:00.
    // since there is no way to set the default time, set it when opening the picker if the value is blank
    if (isTimeEnabled.value && internalValue.value === null && picker.value) {
        (picker.value as any).currentHour = 0;
        (picker.value as any).currentMinute = 0;
    }
};

// always confirm value on blur/hide (even if user hits Escape),
// but leaving the previous explicit confirmation logic in place,
// so that it can be easily restored by changing this into a prop with default set to true,
// if the confirmOnHide behaviour gets in the way somewhere outside the order form
const confirmOnHide = ref(true);

const handleHide = () => {
    if (confirmOnHide.value) {
        // closing the picker should confirm the value, unless it was closed by clicking cancel.
        // clicks outside the picker should also confirm the value, and hitting tab should also confirm it.
        // hitting Escape also confirms the value, because it is not possible to reliably catch the Escape key inside the picker
        confirmValue();
    } else {
        // if confirmOnHide is disabled,
        // reload the value after closing the picker to reset it in case it was not confirmed before closing
        loadValue();
    }
};


const handleDateSelect = (newDate: Date) => {
    if (props.type === "date") {
        // in date mode, the picker automatically closes when clicking on a date.
        // this should be treated as confirmation.
        shouldAutoConfirmOnInternalValueChange.value = true;
    }

    if (props.type == "datetimerange") {
        // when selecting the end date in a range, set the default time to 23:59
        // but only if the main value is blank.
        // this ensures that when the field is blank and the user clicks on start and then end date,
        // the start time will be 00:00 on the first clicked date and end time will be 23:59 on the second clicked date.

        // this does not modify the values if the field already has a value

        const rangeValue = internalValue.value as [Date | null, Date | null] | null;
        const internalEndDate = rangeValue && rangeValue[1] ? rangeValue[1] : null;

        if (internalEndDate === newDate && !value.value) {
            (internalValue.value as [Date, Date])[1].setHours(23, 59, 0, 0);
        }
    }
};

const handleInputKeydown = (event: KeyboardEvent) => {
    adjustInternalValueFromKeydown(event);

    if (event.code === "ArrowDown" && document.activeElement !== event.target) {
        // PrimeVue moves the focus away from the input on ArrowDown, so we need to manually focus it back
        focus();
        return;
    }

    if (event.code === "Escape") {
        // note that this handler only catches the Escape key when the input is focused,
        // not when the picker is open and the focus is there,
        // so this does not catch ALL escape key presses
        if (!confirmOnHide.value) {
            cancelValue();
        }
        return;
    }
};

const handlePickerKeydown = (emittedEvent: Event) => {
    const event = emittedEvent as KeyboardEvent;

    // for some reason, PrimeVue initially emits Enter key on the component itself, not on the input,
    // so it needs to be handled separately
    if (event.code === "Enter") {
        confirmValueAndClose();
        return;
    }
};

const adjustInternalValueFromKeydown = (event: KeyboardEvent) => {
    // arrow up = +1 day
    // arrow down = -1 day
    // ctrl + arrow up = +1 month
    // ctrl + arrow down = -1 month

    if (props.type === "datetimerange") {
        return;
    }
    if (event.code !== "ArrowDown" && event.code !== "ArrowUp") {
        return;
    }

    // if the value is blank, the arrows should adjust from the current date
    const initialDate = (internalValue.value || startOfDay(new Date())) as Date;
    const unit = (event.ctrlKey || event.metaKey) ? "months" : "days";
    const value = (event.code === "ArrowDown") ? -1 : 1;

    internalValue.value = add(initialDate, { [unit]: value });
};

const isTimeEnabled = computed(() => {
    return ["datetime", "datetimerange"].includes(props.type);
});

const currentPickerView = computed((): "date" | "month" | "year" | null => {
    if (!picker.value) {
        return null;
    }
    return (picker.value as any).currentView;
});

const areActionsEnabled = computed(() => {
    // action buttons are only needed when time is shown, as date-only mode confirms immediately on date click.
    if (!isTimeEnabled.value) {
        return false;
    }

    // also, action buttons should not be shown when showing month or year selection, only when the main date view is open
    if (currentPickerView.value !== "date") {
        return false;
    }

    return true;
});

const isInputIconVisible = computed(() => {
    return props.type !== "datetimerange";
});

const isLabelVisible = computed(() => props.labelVisible || props.layout === "compact");

const title = computed(() => {
    return (props.label && !isLabelVisible.value) ? props.label : undefined;
});

const classes = computed(() => {
    const classes: string[] = [];

    if (props.errors && props.errors.length > 0) {
        classes.push("has-error");
    }

    if (isInputIconVisible.value) {
        classes.push("has-input-icon");
    }

    if (props.disabled) {
        classes.push("disabled");
    }

    if (props.changed) {
        classes.push("changed");
    }

    return classes;
});

const inputProps = computed(() => {
    const result: Record<string, any> = {
        name: props.name,
        selectionMode: (props.type === "datetimerange") ? "range" : "single",
        disabled: props.disabled,
        placeholder: props.placeholder,
        dateFormat: "yy-mm-dd",
        showIcon: isInputIconVisible.value,
        iconDisplay: "input",
        pt: {
            pcInputText: {
                root: {
                    onkeydown: handleInputKeydown
                }
            }
        },
        autoIndex: props.containerMode !== "modal-dialog",
        baseZIndex: (props.containerMode === "modal-dialog") ? 3000 : undefined,
        minDate: (props.minDate) ? convertModelValueToInternalValue(props.minDate) : undefined,
        maxDate: (props.maxDate) ? convertModelValueToInternalValue(props.maxDate) : undefined,
    };

    if (isTimeEnabled.value) {
        result.showTime = true;
        result.hourFormat = "24";
    }

    return result;
});

const field = useTemplateRef("field");

const picker = useTemplateRef("picker");

const focus = () => {
    if (field.value) {
        const input = field.value.querySelector("input");
        if (input) {
            input.focus();
        }
    }
};

defineExpose({
    focus
});


const emit = defineEmits<{
    (e: "change"): void,
    (e: "click"): void,
}>();


</script>
<style scoped lang="scss">
.field {
    display: block;
    position: relative;
    width: 100%;

    :deep(.p-datepicker) {
        width: 100%;
    }

    $input-icon-size: steps(2);
    $input-icon-horizontal-padding: 6px;
    $input-icon-box-width: $input-icon-size + ($input-icon-horizontal-padding * 2);

    :deep(.p-inputtext) {
        --p-inputtext-color: #{$color-text-normal};
        --p-inputtext-background: #{$color-background-lightest};
        --p-inputtext-disabled-color: #{$color-text-disabled};
        --p-inputtext-border-color: #{$color-border-darker};
        --p-inputtext-hover-border-color: #{$color-border-hover};
        --p-inputtext-focus-border-color: #{$color-border-dark};
        --p-inputtext-placeholder-color: #{$color-text-lightest};

        &::placeholder {
            opacity: 1;
        }
    }

    &:not(.disabled) {
        :deep(.p-inputtext) {
            @include outline-when-active;
        }
    }

    :deep(.p-datepicker-input-icon-container) {
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        padding: 0 $input-icon-horizontal-padding;
        pointer-events: none;
        color: $color-text-lightest;

        .svg {
            svg {
                width: $input-icon-size;
                height: $input-icon-size;
            }
        }
    }

    &.has-error {
        :deep(.p-inputtext) {
            border-color: $color-border-error;
        }
    }

    &.disabled {
        .label {
            color: $color-text-disabled;
        }

        :deep(.p-inputtext) {
            background: $color-background-light;
            border-color: $color-border-normal;
        }

        :deep(.p-inputtext),
        :deep(.p-datepicker-input-icon-container) {
            cursor: not-allowed;
            color: $color-text-disabled;
        }
    }

    &.changed {
        :deep(.p-inputtext) {
            color: $color-text-changed;
        }
    }

    .description {
        display: flex;
        align-items: center;
        color: $color-text-lightest;
    }

    &[data-size="medium"] {
        :deep(.p-inputtext) {
            border-radius: $element-border-radius-small;
        }

        .description {
            padding: 0;
            @include small-text;
        }
    }

    &[data-size="large"] {
        :deep(.p-inputtext) {
            height: steps(4.5);
            padding: 0 8px;
            border-radius: $element-border-radius;
        }

        &.has-input-icon {
            :deep(.p-inputtext) {
                padding-right: $input-icon-box-width;
            }
        }

        .description {
            padding-top: steps(1);
            padding-bottom: steps(1);
            @include normal-text;
        }
    }

    &[data-layout="loose"][data-size="medium"] {
        .label {
            @include small-text;
        }

        :deep(.p-inputtext) {
            height: steps(3);
            padding: 0 6px;

            border-radius: $element-border-radius-smallest;

            @include normal-text;
        }

        &.has-input-icon {
            :deep(.p-inputtext) {
                padding-right: $input-icon-box-width;
            }
        }
    }

    &[data-layout="loose"][data-size="large"] {
        .label {
            @include normal-text;
        }

        :deep(.p-inputtext) {
            border-radius: $element-border-radius-small;
            @include normal-text;
        }
    }

    &[data-layout="compact"][data-size="medium"] {
        .label {
            @include tiny-medium-text;
            position: absolute;
            z-index: 1; // any positive z-index to put it above the input
            top: 4px;
            left: 6px;
            right: $input-icon-box-width;
            width: auto;
            padding-bottom: 0;
            pointer-events: none;
        }

        :deep(.p-inputtext) {
            height: steps(3.5);
            padding: 10px 6px 0;

            border-radius: $element-border-radius-smaller;

            @include small-medium-text;
        }

        &.has-input-icon {
            :deep(.p-inputtext) {
                padding-right: $input-icon-box-width;
            }
        }
    }

    &[data-layout="compact"][data-size="large"] {
        .label {
            @include small-text;
            position: absolute;
            z-index: 1; // any positive z-index to put it above the input
            top: 3px;
            left: steps(1);
            right: $input-icon-box-width;
            width: auto;
            padding-bottom: 0;
            pointer-events: none;
        }

        :deep(.p-inputtext) {
            padding-top: 14px;
            border-radius: $element-border-radius-small;

            @include normal-text;
        }
    }

}
</style>
<style lang="scss">
.p-datepicker-panel {
    --p-datepicker-panel-padding: #{steps(1)};
    --p-datepicker-panel-background: #{$color-background-lightest};
    --p-datepicker-panel-color: #{ $color-text-lighter};
    --p-datepicker-panel-border-color: #{$color-border-normal};
    --p-datepicker-panel-border-radius: #{$element-border-radius};
    --p-datepicker-header-padding: 0 #{steps(1)} #{steps(1)};
    --p-datepicker-header-border-color: #{$color-border-light};
    --p-datepicker-select-month-padding: #{steps(0.5)};
    --p-datepicker-select-year-padding: #{steps(0.5)};
    --p-datepicker-month-padding: #{steps(0.5)};
    --p-datepicker-month-border-radius: #{$element-border-radius};
    --p-datepicker-year-padding: #{steps(0.5)};
    --p-datepicker-year-border-radius: #{$element-border-radius};
    --p-datepicker-year-view-margin: #{steps(1)} 0;
    --p-datepicker-month-view-margin: #{steps(1)} 0;
    --p-datepicker-day-view-margin: #{steps(1)} 0;
    --p-datepicker-date-width: #{steps(3.5)};
    --p-datepicker-date-height: #{steps(3.5)};
    --p-datepicker-date-border-radius: #{steps(3.5)};
    --p-datepicker-date-selected-color: #{$color-text-inverted};
    --p-datepicker-date-selected-background: #{$color-background-inverted};
    --p-datepicker-week-day-padding: #{steps(0.5)};
    --p-datepicker-time-picker-gap: #{steps(1.5)};
    --p-datepicker-date-hover-background: #{$color-background-light};
    --p-datepicker-date-range-selected-background: #{$color-background-light};

    @include panel-shadow;

    // ensure the panel does not obscure the focus outline/shadow of the input field.
    // cannot use translateY, because we don't know whether the panel is displayed above or below the input field.
    // when it is displayed above, PrimeVue positions it with its own negative margin that overrides this.
    margin-top: 2px;

    .p-datepicker-header,
    .p-datepicker-day-view,
    .p-datepicker-weekday {
        @include normal-text;
    }

    .p-datepicker-title {
        @include normal-medium-text;
    }

    .p-datepicker-weekday {
        color: $color-text-lightest;
    }

    .p-datepicker-day:not(.p-datepicker-day-selected),
    .p-datepicker-month:not(.p-datepicker-month-selected),
    .p-datepicker-year:not(.p-datepicker-year-selected) {
        &.p-disabled {
            color: $color-text-lightest;
            background: $color-background-lightest;
        }
    }

    .p-datepicker-time-picker span {
        @include normal-text;
    }

    .actions {
        display: flex;
        flex-direction: row-reverse;
        gap: steps(2);
        margin-top: steps(1);

        .button {
            flex: 1 1 50%;
        }
    }

}
</style>
