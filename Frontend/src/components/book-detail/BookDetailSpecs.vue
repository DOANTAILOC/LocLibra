<template>
  <section>
    <div class="mb-4 flex items-baseline gap-4">
      <h2 class="font-headline text-2xl">Thông tin chi tiết</h2>
      <div class="h-px flex-1 bg-[var(--surface-container)]"></div>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <article
        v-for="item in detailItems"
        :key="item.label"
        class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4"
      >
        <p
          class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
        >
          {{ item.label }}
        </p>
        <p class="mt-1 text-sm font-semibold text-[var(--on-surface)]">
          {{ item.value }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  detailItems: {
    type: Array,
    default: () => [],
  },
});
</script>
