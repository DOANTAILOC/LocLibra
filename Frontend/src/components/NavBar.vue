<template>
  <header
    class="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-primary/10 shadow-sm"
  >
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2">
        <span
          class="text-xl font-bold tracking-tight text-[var(--on-surface)] uppercase"
        >
          Loc<span class="text-primary">Library</span>
        </span>
      </RouterLink>

      <nav
        class="flex max-w-[52vw] items-center gap-6 overflow-x-auto whitespace-nowrap"
      >
        <RouterLink
          to="/"
          :class="navItemClass(route.path === '/' && !route.hash)"
          @click="scrollToTop"
        >
          Trang Chủ
        </RouterLink>

        <RouterLink
          to="/about"
          :class="navItemClass(route.path === '/about')"
          @click="scrollToTop"
        >
          Về chúng tôi
        </RouterLink>

        <RouterLink
          to="/books"
          :class="navItemClass(route.path === '/books')"
          @click="scrollToTop"
        >
          Kho Sách
        </RouterLink>

        <RouterLink
          to="/my-loans"
          :class="navItemClass(route.path === '/my-loans')"
          @click="goToMyLoans"
        >
          Mượn của tôi
        </RouterLink>

        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          :class="navItemClass(route.path.startsWith('/admin'))"
          @click="scrollToTop"
        >
          Quản trị
        </RouterLink>
      </nav>

      <div v-if="!authStore.isLoggedIn" class="flex items-center gap-3">
        <RouterLink
          to="/login"
          class="btn-ghost px-4 py-2 text-xs tracking-[0.08em]"
        >
          Đăng Nhập
        </RouterLink>
        <RouterLink
          to="/register"
          class="btn-primary px-5 py-2.5 text-xs shadow-md shadow-primary/10"
        >
          Đăng Ký
        </RouterLink>
      </div>

      <div v-else class="relative flex items-center gap-3" ref="accountMenuRef">
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
          class="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-sm font-bold uppercase text-white"
          :title="displayName"
          @click="toggleAccountMenu"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Avatar"
            class="h-full w-full object-cover"
          />
          <span v-else>{{ avatarText }}</span>
        </button>

        <div
          v-if="isAccountMenuOpen"
          class="absolute right-0 top-14 z-50 w-72 rounded-xl border border-[var(--outline-variant)] bg-white p-4 shadow-xl"
        >
          <div
            class="mb-4 flex items-center gap-3 border-b border-[var(--outline-variant)] pb-3"
          >
            <div
              class="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-sm font-bold uppercase text-white"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Avatar"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ avatarText }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-[var(--on-surface)]">
                {{ displayName }}
              </p>
              <p class="text-xs text-[var(--on-surface-variant)]">
                {{ phoneNumber }}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <button
              type="button"
              class="w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-left text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)]"
              @click="goToProfile"
            >
              Xem chi tiết
            </button>
            <button
              type="button"
              class="w-full rounded-lg bg-[var(--primary)] px-3 py-2 text-left text-sm font-semibold text-white transition hover:brightness-95"
              @click="handleLogout"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const accountMenuRef = ref(null);
const isAccountMenuOpen = ref(false);

const displayName = computed(() => {
  const fullName = [
    authStore.user?.profile?.HOLOT,
    authStore.user?.profile?.TEN,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    authStore.user?.profile?.HoTenNV ||
    authStore.user?.account?.username ||
    "Reader"
  );
});

const phoneNumber = computed(() => {
  return (
    authStore.user?.profile?.DIENTHOAI ||
    authStore.user?.profile?.SoDienThoai ||
    "Chưa cập nhật SĐT"
  );
});

function navItemClass(isActive) {
  return [
    "relative border-b-2 pb-1 text-sm font-semibold transition-colors",
    isActive
      ? "border-primary text-primary"
      : "border-transparent text-[var(--outline)] hover:text-[var(--on-surface-variant)]",
  ];
}

const avatarText = computed(() => {
  const source = displayName.value.trim();
  return source ? source.slice(0, 2) : "RL";
});

const avatarUrl = computed(() =>
  String(authStore.user?.profile?.AVATAR_URL || "").trim(),
);

function toggleAccountMenu() {
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
}

function closeAccountMenu() {
  isAccountMenuOpen.value = false;
}

function handleClickOutside(event) {
  if (!accountMenuRef.value?.contains(event.target)) {
    closeAccountMenu();
  }
}

function goToProfile() {
  closeAccountMenu();
  router.push("/my-profile");
}

function handleLogout() {
  closeAccountMenu();
  authStore.logout();
}

function goToMyLoans(event) {
  if (!authStore.isLoggedIn) {
    event.preventDefault();
    window.alert("Vui lòng đăng nhập để xem mục Mượn của tôi.");
    return;
  }

  scrollToTop();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
