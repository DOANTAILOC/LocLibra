<template>
  <article
    class="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-[0_6px_24px_rgb(54_58_39/10%)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(54_58_39/14%)]"
    @click="emit('detail', book)"
  >
    <div
      class="relative flex items-center justify-center bg-[var(--surface-container-high)] p-4 md:p-5"
    >
      <div
        class="relative w-full max-w-[260px] overflow-hidden rounded-lg border border-[rgb(184_188_163/25%)] bg-white"
        style="aspect-ratio: 2 / 3"
      >
        <img
          :src="cover"
          :alt="book.TENSACH"
          class="h-full w-full object-cover"
        />
      </div>
      <span
        class="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        :class="
          isAvailable && !isBorrowLocked
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--outline)] text-white'
        "
      >
        {{ isAvailable && !isBorrowLocked ? "Còn sách" : unavailableLabel }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-5">
      <div class="flex items-center gap-1">
        <span
          v-for="star in 5"
          :key="star"
          class="material-symbols-outlined text-[16px]"
          :class="[
            starClass(star),
            { 'material-symbols-filled': starIcon(star) !== 'star_outline' },
          ]"
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

      <p class="line-clamp-1 text-sm text-[var(--on-surface-variant)]">
        {{ authorText }}
      </p>

      <p class="line-clamp-1 text-sm text-[var(--on-surface-variant)]">
        Thể loại: {{ genreText }}
      </p>

      <p class="text-sm text-[var(--on-surface-variant)]">
        Số lượng: {{ book.SOQUYEN || 0 }} cuốn
      </p>

      <button
        type="button"
        :class="
          isAvailable && !isBorrowLocked
            ? 'mt-auto inline-flex w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-white transition hover:brightness-95'
            : 'mt-auto inline-flex w-full items-center justify-center rounded-2xl border border-[var(--outline-variant)] bg-white px-5 py-3 text-base font-bold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]'
        "
        @click.stop="onActionClick"
      >
        {{ actionLabel }}
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
  borrowStatus: {
    type: String,
    default: "",
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
const normalizedBorrowStatus = computed(() =>
  String(props.borrowStatus || "")
    .trim()
    .toUpperCase(),
);
const isBorrowLocked = computed(() =>
  ["PENDING", "APPROVED", "BORROWING", "OVERDUE"].includes(
    normalizedBorrowStatus.value,
  ),
);
const averageValue = computed(() => Number(props.averageScore || 0));
const ratingText = computed(() => Number(props.averageScore || 0).toFixed(1));
const authorText = computed(() => {
  const value = props.book.TACGIA_TEN || props.book.TACGIA;
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "Chưa rõ tác giả";
  }
  return value || "Chưa rõ tác giả";
});

function normalizeListValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return String(item.name || item.TENTL || item.label || "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

const genreText = computed(() => {
  const genreNames = normalizeListValue(props.book.THELOAI_TEN);
  if (genreNames.length) {
    return genreNames.join(", ");
  }

  const genreFallback = normalizeListValue(props.book.THELOAI);
  if (genreFallback.length) {
    return genreFallback.join(", ");
  }

  return "Chưa phân loại";
});

const isBorrowedStatus = computed(() => {
  const status = String(props.book.TRANGTHAI || "").toLowerCase();
  return status.includes("dang") && status.includes("muon");
});

const borrowStatusLabel = computed(() => {
  const map = {
    PENDING: "Đang đăng ký",
    APPROVED: "Đã duyệt",
    BORROWING: "Đang mượn",
    OVERDUE: "Quá hạn",
  };

  return map[normalizedBorrowStatus.value] || "";
});

const actionLabel = computed(() => {
  if (normalizedBorrowStatus.value === "PENDING") return "Đang đăng ký";
  if (normalizedBorrowStatus.value === "APPROVED") return "Đã duyệt - chờ nhận";
  if (normalizedBorrowStatus.value === "BORROWING") return "Đang mượn";
  if (normalizedBorrowStatus.value === "OVERDUE") return "Đang quá hạn";
  return isAvailable.value ? "Mượn ngay" : "Xem chi tiết";
});

const unavailableLabel = computed(
  () =>
    borrowStatusLabel.value ||
    (isBorrowedStatus.value ? "Đang mượn" : "Hết sách"),
);

const cover = computed(() => {
  if (props.book.ANHBIA_URL) {
    return props.book.ANHBIA_URL;
  }

  const seed = encodeURIComponent(
    props.book.MASACH || props.book.TENSACH || "book",
  );
  return `https://picsum.photos/seed/${seed}/420/630`;
});

function onActionClick() {
  if (isAvailable.value && !isBorrowLocked.value) {
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
