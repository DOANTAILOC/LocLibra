<template>
  <div :class="wrapperClass">
    <p
      class="text-[11px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
    >
      {{ rangeLabel }}
    </p>

    <div v-if="totalPages > 1" class="flex items-center gap-1.5">
      <button
        type="button"
        class="rounded-md p-1 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentPage === 1"
        @click="emitPage(currentPage - 1)"
      >
        <span class="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      <button
        v-for="page in pageNumbers"
        :key="`page-${page}`"
        type="button"
        class="flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold transition"
        :class="
          page === currentPage
            ? 'bg-[var(--primary)] text-[var(--on-primary)]'
            : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)]'
        "
        @click="emitPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="rounded-md p-1 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentPage === totalPages"
        @click="emitPage(currentPage + 1)"
      >
        <span class="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  rangeLabel: {
    type: String,
    default: "",
  },
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  boxed: {
    type: Boolean,
    default: false,
  },
  scrollToTopOnChange: {
    type: Boolean,
    default: false,
  },
  scrollTopOffset: {
    type: Number,
    default: 0,
  },
  scrollBehavior: {
    type: String,
    default: "smooth",
  },
});

const emit = defineEmits(["update:current-page"]);

const wrapperClass = computed(() => {
  if (props.boxed) {
    return "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3";
  }

  return "flex items-center gap-3";
});

const pageNumbers = computed(() => {
  return Array.from({ length: props.totalPages }, (_, index) => index + 1);
});

function emitPage(page) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber)) return;
  if (pageNumber < 1 || pageNumber > props.totalPages) return;

  if (props.scrollToTopOnChange && typeof window !== "undefined") {
    window.scrollTo({
      top: Math.max(0, Number(props.scrollTopOffset) || 0),
      behavior: props.scrollBehavior,
    });
  }

  emit("update:current-page", pageNumber);
}
</script>
