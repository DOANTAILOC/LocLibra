<template>
  <div
    class="overflow-hidden rounded-xl border border-[rgb(184_188_163/20%)] bg-[var(--surface-container-lowest)] shadow-sm"
  >
    <table :class="['w-full border-collapse text-left', minWidthClass]">
      <thead>
        <slot name="head" />
      </thead>
      <tbody class="divide-y divide-[rgb(184_188_163/12%)]">
        <tr v-if="loading">
          <td
            class="px-6 py-6 text-sm text-[var(--on-surface-variant)]"
            :colspan="colspan"
          >
            {{ loadingText }}
          </td>
        </tr>

        <tr v-else-if="empty">
          <td
            class="px-6 py-6 text-sm text-[var(--on-surface-variant)]"
            :colspan="colspan"
          >
            {{ emptyText }}
          </td>
        </tr>

        <slot v-else name="rows" />
      </tbody>
    </table>

    <div
      class="flex items-center justify-between border-t border-[rgb(184_188_163/12%)] bg-[var(--surface-container-low)] px-6 py-4"
    >
      <p
        v-if="totalText"
        class="text-[11px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
      >
        {{ totalText }}
      </p>
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  empty: {
    type: Boolean,
    default: false,
  },
  colspan: {
    type: Number,
    default: 1,
  },
  loadingText: {
    type: String,
    default: "Đang tải dữ liệu...",
  },
  emptyText: {
    type: String,
    default: "Không có dữ liệu",
  },
  totalText: {
    type: String,
    default: "",
  },
  minWidthClass: {
    type: String,
    default: "min-w-[860px]",
  },
});
</script>
