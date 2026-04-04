<template>
  <section>
    <div class="mb-4 flex items-baseline gap-4">
      <h2 class="font-headline text-2xl">Bạn đọc đánh giá</h2>
      <div class="h-px flex-1 bg-[var(--surface-container)]"></div>
    </div>

    <div
      class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5"
    >
      <div
        class="mb-5 rounded-xl border border-[var(--outline-variant)] bg-white p-4"
      >
        <p class="mb-3 text-sm font-semibold text-[var(--on-surface)]">
          Đánh giá của bạn
        </p>

        <div class="mb-3 flex items-center gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full transition"
            :class="
              star <= selectedScore
                ? 'bg-amber-100 text-amber-600'
                : 'bg-[var(--surface-container-low)] text-[var(--outline)] hover:bg-amber-50'
            "
            :disabled="!isLoggedIn || voting"
            @click="emit('update:selectedScore', star)"
          >
            <span class="material-symbols-outlined text-[18px]">{{
              star <= selectedScore ? "star" : "star_outline"
            }}</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="isLoggedIn"
            type="button"
            class="btn-primary px-4 py-2 text-[11px]"
            :disabled="voting || selectedScore < 1"
            @click="emit('submitVote')"
          >
            {{ voting ? "Đang gửi..." : "Gửi đánh giá" }}
          </button>

          <button
            v-if="isLoggedIn && myVoteScore"
            type="button"
            class="btn-secondary px-4 py-2 text-[11px]"
            :disabled="voting"
            @click="emit('removeVote')"
          >
            Hủy vote
          </button>

          <button
            v-if="!isLoggedIn"
            type="button"
            class="btn-secondary px-4 py-2 text-[11px]"
            @click="emit('goLogin')"
          >
            Đăng nhập để vote
          </button>
        </div>

        <p
          v-if="voteMessage"
          class="mt-2 text-xs text-[var(--on-surface-variant)]"
        >
          {{ voteMessage }}
        </p>
      </div>

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
          <p class="text-xs text-[var(--on-surface-variant)]">
            Điểm: {{ voter.score }}/5
          </p>
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
  selectedScore: {
    type: Number,
    default: 0,
  },
  voting: {
    type: Boolean,
    default: false,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  myVoteScore: {
    type: Number,
    default: 0,
  },
  voteMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:selectedScore",
  "submitVote",
  "removeVote",
  "goLogin",
]);
</script>
