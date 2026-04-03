<template>
  <header
    class="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-primary/10 shadow-sm"
  >
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="material-icons text-primary text-3xl">auto_stories</span>
        <span
          class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-50 uppercase"
        >
          Loc<span class="text-primary">Library</span>
        </span>
      </RouterLink>

      <nav class="hidden md:flex items-center gap-8">
        <RouterLink
          to="/"
          class="transition-colors"
          :class="
            route.path === '/'
              ? 'text-primary font-semibold'
              : 'text-text-muted dark:text-slate-300 hover:text-primary'
          "
        >
          Trang Chủ
        </RouterLink>

        <RouterLink
          to="/books"
          class="transition-colors"
          :class="
            route.path === '/books'
              ? 'text-primary font-semibold'
              : 'text-text-muted dark:text-slate-300 hover:text-primary'
          "
        >
          Tủ Sách
        </RouterLink>

        <button
          type="button"
          class="transition-colors"
          :class="
            route.path === '/my-loans'
              ? 'text-primary font-semibold'
              : 'text-text-muted dark:text-slate-300 hover:text-primary'
          "
          @click="goToMyLoans"
        >
          Mượn của tôi
        </button>
      </nav>

      <div v-if="!authStore.isLoggedIn" class="flex items-center gap-3">
        <RouterLink
          to="/login"
          class="px-5 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
        >
          Đăng Nhập
        </RouterLink>
        <RouterLink
          to="/register"
          class="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
        >
          Đăng Ký
        </RouterLink>
      </div>

      <div v-else class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-white/80 text-[var(--primary)] transition hover:-translate-y-px hover:bg-white"
          aria-label="Thông báo"
        >
          <span class="material-symbols-outlined text-[20px]"
            >notifications</span
          >
        </button>

        <button
          type="button"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--primary)] px-2 text-sm font-bold uppercase text-white"
          :title="displayName"
        >
          {{ avatarText }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const displayName = computed(() => {
  return (
    authStore.user?.profile?.TEN ||
    authStore.user?.account?.username ||
    "Reader"
  );
});

const avatarText = computed(() => {
  const source = displayName.value.trim();
  return source ? source.slice(0, 2) : "RL";
});

function goToMyLoans() {
  if (!authStore.isLoggedIn) {
    window.alert("Vui lòng đăng nhập để xem mục Mượn của tôi.");
    return;
  }

  router.push("/my-loans");
}
</script>
