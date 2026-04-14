<template>
  <section>
    <div class="mb-4 flex items-baseline gap-4">
      <h2 class="font-headline text-2xl">Bạn đọc đánh giá</h2>
      <div class="h-px flex-1 bg-[var(--surface-container)]"></div>
    </div>

    <div
      class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5"
    >
      <p class="mb-4 text-sm text-[var(--on-surface-variant)]">
        Đánh giá chỉ được thực hiện tại mục phiếu mượn đã trả trong trang Mượn
        của tôi.
      </p>

      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-[var(--on-surface)]">
          Điểm trung bình:
          <strong>{{ voteSummary.averageScore }}</strong>
        </p>
        <p
          class="text-xs uppercase tracking-[0.1em] text-[var(--on-surface-variant)]"
        >
          {{ voteSummary.totalVotes }} lượt vote
        </p>
      </div>

      <div class="max-h-56 space-y-3 overflow-auto pr-1">
        <div
          v-for="voter in voteSummary.voters.slice(0, 8)"
          :key="`${voter.accountId}-${voter.votedAt}`"
          class="rounded-lg border border-[var(--outline-variant)] bg-white p-3"
        >
          <p class="text-sm font-semibold text-[var(--on-surface)]">
            {{ voter.username }}
          </p>
          <div class="mt-1 flex items-center gap-1 text-amber-600">
            <span
              v-for="star in 5"
              :key="`voter-${voter.accountId}-${voter.votedAt}-${star}`"
              class="material-symbols-outlined text-[16px]"
              :class="{
                'material-symbols-filled': star <= Number(voter.score || 0),
              }"
            >
              {{ star <= Number(voter.score || 0) ? "star" : "star_outline" }}
            </span>
            <span class="ml-1 text-xs text-[var(--on-surface-variant)]">
              {{ voter.score }}/5
            </span>
          </div>
        </div>
        <p
          v-if="!voteSummary.voters.length"
          class="text-sm text-[var(--on-surface-variant)]"
        >
          Chưa có vote cho sách này.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  voteSummary: {
    type: Object,
    required: true,
  },
});
</script>
