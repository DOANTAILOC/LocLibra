<template>
  <div
    class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
  >
    <div>
      <h2 class="text-3xl tracking-tight">{{ title }}</h2>
      <p class="text-sm text-[var(--on-surface-variant)]">
        {{ description }}
      </p>
    </div>

    <div class="flex flex-wrap gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});
</script>
