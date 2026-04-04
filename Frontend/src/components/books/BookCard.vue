<template>
  <article
    class="cursor-pointer overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-[0_6px_24px_rgb(54_58_39/10%)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(54_58_39/14%)]"
    @click="emit('detail', book)"
  >
    <div
      class="relative flex items-center justify-center bg-[var(--surface-container-high)] p-4 md:p-5"
    >
      <img
        :src="cover"
        :alt="book.TENSACH"
        class="h-72 w-auto object-contain md:h-80"
      />
      <span
        class="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        :class="
          isAvailable
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--outline)] text-white'
        "
      >
        {{ isAvailable ? "Còn sách" : unavailableLabel }}
      </span>
    </div>

    <div class="space-y-2 p-5">
      <div class="flex items-center gap-1">
        <span
          v-for="star in 5"
          :key="star"
          class="material-symbols-outlined text-[16px]"
          :class="starClass(star)"
        >
          {{ starIcon(star) }}
        </span>
        <span class="ml-1 text-sm font-semibold text-[var(--outline)]"
          >({{ ratingText }})</span
        >
        <span class="text-xs text-[var(--outline)]">{{ totalVotes }} vote</span>
      </div>

      <h3
        class="line-clamp-2 text-xl font-bold leading-tight text-[var(--on-surface)]"
      >
        {{ book.TENSACH }}
      </h3>

      <p class="text-sm text-[var(--on-surface-variant)]">
        {{ book.TACGIA || "Chưa rõ tác giả" }}
      </p>

      <p class="text-sm text-[var(--on-surface-variant)]">
        Thể loại: {{ book.THELOAI || "Chưa phân loại" }}
      </p>

      <p class="text-sm text-[var(--on-surface-variant)]">
        Số lượng: {{ book.SOQUYEN || 0 }} cuốn
      </p>

      <button
        type="button"
        :class="
          isAvailable
            ? 'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-white transition hover:brightness-95'
            : 'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--outline-variant)] bg-white px-5 py-3 text-base font-bold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]'
        "
        @click.stop="onActionClick"
      >
        <span class="material-symbols-outlined text-[20px]">{{
          isAvailable ? "menu_book" : "visibility"
        }}</span>
        {{ isAvailable ? "Mượn ngay" : "Xem chi tiết" }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  averageScore: {
    type: [Number, String],
    default: 0,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["borrow", "detail"]);

const isAvailable = computed(() => Number(props.book.SOQUYEN || 0) > 0);
const averageValue = computed(() => Number(props.averageScore || 0));
const ratingText = computed(() => Number(props.averageScore || 0).toFixed(1));

const isBorrowedStatus = computed(() => {
  const status = String(props.book.TRANGTHAI || "").toLowerCase();
  return status.includes("dang") && status.includes("muon");
});

const unavailableLabel = computed(() =>
  isBorrowedStatus.value ? "Đang mượn" : "Hết sách",
);

const cover = computed(() => {
  const seed = encodeURIComponent(
    props.book.MASACH || props.book.TENSACH || "book",
  );
  return `https://picsum.photos/seed/${seed}/600/420`;
});

function onActionClick() {
  if (isAvailable.value) {
    emit("borrow", props.book);
    return;
  }

  emit("detail", props.book);
}

function starIcon(star) {
  if (averageValue.value >= star) return "star";
  if (averageValue.value >= star - 0.5) return "star_half";
  return "star_outline";
}

function starClass(star) {
  return averageValue.value >= star - 0.5
    ? "text-amber-600"
    : "text-[var(--outline-variant)]";
}
</script>
