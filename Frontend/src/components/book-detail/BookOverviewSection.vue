<template>
  <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
    <div class="lg:col-span-4">
      <div class="sticky top-24">
        <div
          class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 editorial-shadow"
        >
          <div
            class="flex justify-center overflow-hidden rounded-lg bg-[var(--surface-container-lowest)]"
          >
            <img
              :src="bookCover"
              :alt="book.TENSACH"
              class="h-[52vh] w-auto max-w-full cursor-zoom-in object-contain lg:h-[calc(100vh-24rem)]"
              @click="showCoverModal = true"
            />
          </div>

          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="btn-primary flex-1 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="borrowDisabled"
              @click="emit('borrow')"
            >
              <span>{{ borrowActionLabel }}</span>
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
    </div>

    <div
      class="space-y-10 lg:col-span-8 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2"
    >
      <div>
        <span
          class="inline-flex items-center rounded-full px-4 py-1 text-[10px] font-bold tracking-[0.14em] uppercase"
          :class="
            isAvailable && !borrowStatusLabel
              ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
              : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
          "
        >
          {{ borrowStatusLabel || (isAvailable ? "Đang có sẵn" : "Hết sách") }}
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
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <div class="flex -space-x-2">
                <img
                  v-for="author in authorDetailsWithAvatar"
                  :key="`author-avatar-${author.code}`"
                  :src="author.avatarUrl"
                  :alt="author.name"
                  class="h-8 w-8 rounded-full border-2 border-[var(--surface-container-lowest)] object-cover"
                />
              </div>
              <p class="text-sm font-bold text-[var(--on-surface)]">
                {{ authorText }}
              </p>
            </div>
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

  <Teleport to="body">
    <div
      v-if="showCoverModal"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(13_15_8/78%)] p-4"
      @click.self="showCoverModal = false"
    >
      <button
        type="button"
        class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(254_253_241/92%)] text-[var(--on-surface)]"
        @click="showCoverModal = false"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <img
        :src="bookCover"
        :alt="book.TENSACH"
        class="max-h-[92vh] w-auto max-w-[95vw] rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] object-contain"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";

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
  borrowActionLabel: {
    type: String,
    default: "Mượn sách",
  },
  borrowStatusLabel: {
    type: String,
    default: "",
  },
  borrowDisabled: {
    type: Boolean,
    default: false,
  },
});

const authorText = computed(() => {
  const value =
    props.book?.TACGIA_CHI_TIET?.map((item) => item?.name) ||
    props.book?.TACGIA_TEN ||
    props.book?.TACGIA;
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "Chưa rõ";
  }
  return value || "Chưa rõ";
});

const authorDetailsWithAvatar = computed(() => {
  const authorDetails = Array.isArray(props.book?.TACGIA_CHI_TIET)
    ? props.book.TACGIA_CHI_TIET
    : [];

  return authorDetails
    .map((author, index) => ({
      code: String(author?.code || author?.name || `author-${index}`),
      name: String(author?.name || "Tác giả"),
      avatarUrl: String(author?.avatarUrl || "").trim(),
    }))
    .filter((author) => Boolean(author.avatarUrl));
});

const showCoverModal = ref(false);

const emit = defineEmits(["borrow"]);
</script>
