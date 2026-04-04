<template>
  <article
    class="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-[0_6px_24px_rgb(54_58_39/10%)]"
  >
    <div class="relative h-72 bg-[var(--surface-container-high)] md:h-80">
      <img
        :src="cover"
        :alt="book.TENSACH"
        class="h-full w-full object-cover"
      />
      <span
        class="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        :class="
          isAvailable
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--outline)] text-white'
        "
      >
        {{ isAvailable ? "Còn sách" : "Hết sách" }}
      </span>
    </div>

    <div class="space-y-2 p-5">
      <div class="flex items-center gap-1 text-[var(--primary)]">
        <span class="material-symbols-outlined text-[16px]">star</span>
        <span class="material-symbols-outlined text-[16px]">star</span>
        <span class="material-symbols-outlined text-[16px]">star</span>
        <span class="material-symbols-outlined text-[16px]">star</span>
        <span class="material-symbols-outlined text-[16px]">star_half</span>
        <span class="ml-1 text-sm font-semibold text-[var(--outline)]"
          >({{ ratingText }})</span
        >
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
        class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-white transition hover:brightness-95"
        @click="emit('borrow', book)"
      >
        <span class="material-symbols-outlined text-[20px]">menu_book</span>
        Mượn ngay
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
});

const emit = defineEmits(["borrow"]);

const isAvailable = computed(() => Number(props.book.SOQUYEN || 0) > 0);
const ratingText = computed(() => Number(props.book.DANHGIA || 4).toFixed(1));

const cover = computed(() => {
  const seed = encodeURIComponent(
    props.book.MASACH || props.book.TENSACH || "book",
  );
  return `https://picsum.photos/seed/${seed}/600/420`;
});
</script>
