<script setup lang="ts">
type Preset = {
  label: string;
  value: string;
  ms: number;
};

const props = defineProps<{
  presets: Preset[];
  selectedValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', preset: Preset): void;
}>();

const selectPreset = (preset: Preset) => {
  emit('select', preset);
};
</script>

<template>
  <div class="space-y-2">
    <div class="text-xs font-semibold uppercase text-muted">Quick ranges</div>
    <div class="max-h-56 space-y-1 overflow-y-auto pr-1">
      <UButton
        v-for="preset in presets"
        :key="preset.value"
        variant="ghost"
        color="neutral"
        size="xs"
        class="w-full justify-between"
        @click="selectPreset(preset)"
      >
        <span>{{ preset.label }}</span>
        <UIcon
          v-if="selectedValue === preset.value"
          name="i-heroicons-check-20-solid"
          class="h-4 w-4"
        />
      </UButton>
    </div>
  </div>
</template>
