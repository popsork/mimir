<script setup lang="ts">
const props = defineProps<{
  label: string;
  items: string[];
  modelValue: string[];
  searchPlaceholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const search = ref('');

const filteredItems = computed(() => {
  const needle = search.value.trim().toLowerCase();
  if (!needle) return props.items;
  return props.items.filter((item) => item.toLowerCase().includes(needle));
});

const updateSelection = (next: string[]) => {
  const allItems = props.items;
  if (allItems.length === 0) {
    emit('update:modelValue', []);
    return;
  }

  const current = props.modelValue;
  if (current.length === allItems.length) {
    const removed = current.filter((item) => !next.includes(item));
    if (removed.length === 1) {
      const only = removed[0];
      if (only !== undefined) {
        emit('update:modelValue', [only]);
      }
      return;
    }
  }

  if (next.length === 0) {
    emit('update:modelValue', [...allItems]);
    return;
  }

  emit('update:modelValue', next);
};
</script>

<template>
  <details open class="rounded-lg border border-muted/40 bg-muted/10 p-2">
    <summary class="cursor-pointer select-none text-sm font-semibold">
      {{ label }}
    </summary>
    <div class="mt-2 space-y-2">
      <UInput
        v-model="search"
        size="xs"
        icon="i-heroicons-magnifying-glass-20-solid"
        class="w-full"
        :placeholder="searchPlaceholder || `Search ${label.toLowerCase()}`"
      />
      <div class="max-h-32 overflow-y-auto">
        <UCheckboxGroup
          :model-value="modelValue"
          :items="filteredItems"
          @update:model-value="updateSelection"
        />
      </div>
    </div>
  </details>
</template>
