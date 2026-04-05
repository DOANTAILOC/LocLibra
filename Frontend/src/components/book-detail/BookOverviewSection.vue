<template>
  <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      <div class="sticky top-24">
        <div
          class="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] editorial-shadow"
        >
          <img
            :src="bookCover"
            :alt="book.TENSACH"
            class="w-full object-cover"
          />
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="btn-primary flex-1 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="borrowing || !isAvailable"
            @click="emit('borrow')"
          >
            <span v-if="borrowing">Đang gửi yêu cầu...</span>
            <span v-else>Mượn sách</span>
          </button>
          <button
            type="button"
            class="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
          >
            <span class="material-symbols-outlined">favorite</span>
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-10 lg:col-span-7">
      <div>
        <span
          class="inline-flex items-center rounded-full px-4 py-1 text-[10px] font-bold tracking-[0.14em] uppercase"
          :class="
            isAvailable
              ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
              : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
          "
        >
          {{ isAvailable ? "Đang có sẵn" : "Hết sách" }}
        </span>
        <h1
          class="mt-4 font-headline text-4xl leading-tight text-[var(--on-surface)] md:text-5xl"
        >
          {{ book.TENSACH }}
        </h1>
        <div class="mt-6 flex flex-wrap items-center gap-8">
          <div>
            <p
              class="text-[10px] font-bold tracking-[0.14em] text-[var(--on-surface-variant)] uppercase"
            >
              Tác giả
            </p>
            <p class="text-sm font-bold text-[var(--on-surface)]">
              {{ authorText }}
            </p>
          </div>
          <div>
            <p
              class="text-[10px] font-bold tracking-[0.14em] text-[var(--on-surface-variant)] uppercase"
            >
              Đánh giá
            </p>
            <div class="flex items-center gap-1 text-amber-600">
              <span class="material-symbols-outlined text-[18px]">star</span>
              <span class="font-bold text-[var(--on-surface)]">{{
                voteSummary.averageScore
              }}</span>
              <span class="text-xs text-[var(--on-surface-variant)]"
                >({{ voteSummary.totalVotes }} lượt vote)</span
              >
            </div>
          </div>
        </div>
      </div>

      <section>
        <div class="mb-4 flex items-baseline gap-4">
          <h2 class="font-headline text-2xl">Giới thiệu sách</h2>
          <div class="h-px flex-1 bg-[var(--surface-container)]"></div>
        </div>
        <p class="leading-relaxed text-[var(--on-surface-variant)]">
          {{ book.MOTA_NGAN || "Sách chưa có mô tả ngắn." }}
        </p>
      </section>

      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  bookCover: {
    type: String,
    default: "",
  },
  borrowing: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  voteSummary: {
    type: Object,
    required: true,
  },
});

const authorText = computed(() => {
  const value = props.book?.TACGIA;
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "Chưa rõ";
  }
  return value || "Chưa rõ";
});

const emit = defineEmits(["borrow"]);
</script>
