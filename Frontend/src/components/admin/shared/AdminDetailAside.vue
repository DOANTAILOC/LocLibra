<template>
  <aside
    class="hidden w-80 overflow-y-auto border-l border-[rgb(184_188_163/20%)] bg-[var(--surface-container-low)] p-6 xl:block"
  >
    <div class="mb-8 flex items-center justify-between">
      <h4 class="text-lg">{{ title }}</h4>
      <button
        type="button"
        class="rounded-lg p-1.5 transition hover:bg-[var(--surface-container-highest)]"
      >
        <span class="material-symbols-outlined text-[var(--on-surface-variant)]"
          >close</span
        >
      </button>
    </div>

    <template v-if="hasSelection">
      <slot />
    </template>

    <p v-else class="text-sm text-[var(--on-surface-variant)]">
      {{ emptyText }}
    </p>
  </aside>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Chi tiết",
  },
  hasSelection: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: "Chọn một bản ghi để xem chi tiết.",
  },
});
</script>
