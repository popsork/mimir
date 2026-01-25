<script setup lang="ts">
const { windowMinutes, windowOptions, formatWindowLabel, setWindowMinutes } = useTimeWindow();

const options = computed(() => {
  return windowOptions.map(value => ({
    value,
    label: formatWindowLabel(value),
  }));
});

const selectedOption = computed({
  get: () => options.value.find(opt => opt.value === windowMinutes.value),
  set: (option) => {
    if (option?.value) {
      setWindowMinutes(option.value);
    }
  },
});
</script>

<template>
  <USelectMenu
    v-model="selectedOption"
    :options="options"
    value-attribute="value"
    option-attribute="label"
    placeholder="Select time window"
  />
</template>
