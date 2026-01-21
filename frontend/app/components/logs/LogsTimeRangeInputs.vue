<script setup lang="ts">
const props = defineProps<{
  from: string | null;
  to: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:from', value: string | null): void;
  (e: 'update:to', value: string | null): void;
  (e: 'apply'): void;
}>();

const fromValue = computed({
  get: () => props.from ?? '',
  set: (value: string) => emit('update:from', value === '' ? null : value),
});

const toValue = computed({
  get: () => props.to ?? '',
  set: (value: string) => emit('update:to', value === '' ? null : value),
});
</script>

<template>
  <div class="space-y-3">
    <div>
      <div class="text-sm font-semibold">Time range</div>
      <div class="text-xs text-muted">Pick an absolute range</div>
    </div>

    <UFormField label="From">
      <UInput v-model="fromValue" type="datetime-local" aria-label="Start time" />
    </UFormField>

    <UFormField label="To">
      <UInput v-model="toValue" type="datetime-local" aria-label="End time" />
    </UFormField>

    <UButton size="xs" color="primary" @click="emit('apply')">Apply time range</UButton>

  </div>
</template>
