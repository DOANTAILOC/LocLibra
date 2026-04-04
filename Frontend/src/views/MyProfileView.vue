<template>
  <main class="container mx-auto px-4 py-10">
    <section
      class="mx-auto max-w-3xl panel-surface editorial-shadow p-6 md:p-8"
    >
      <header
        class="mb-6 flex items-center gap-4 border-b border-[var(--outline-variant)] pb-4"
      >
        <div
          class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold uppercase text-white"
        >
          {{ avatarText }}
        </div>
        <div>
          <p
            class="text-xs font-bold tracking-[0.14em] text-[var(--on-surface-variant)] uppercase"
          >
            Tài khoản cá nhân
          </p>
          <h1 class="text-2xl font-semibold text-[var(--on-surface)]">
            {{ displayName }}
          </h1>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4"
        >
          <p
            class="text-xs font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
          >
            Avatar
          </p>
          <p class="mt-2 text-sm text-[var(--on-surface)]">{{ avatarText }}</p>
        </article>

        <article
          class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4"
        >
          <p
            class="text-xs font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
          >
            Họ tên
          </p>
          <p class="mt-2 text-sm text-[var(--on-surface)]">{{ displayName }}</p>
        </article>

        <article
          class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4"
        >
          <p
            class="text-xs font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
          >
            Số điện thoại
          </p>
          <p class="mt-2 text-sm text-[var(--on-surface)]">{{ phoneNumber }}</p>
        </article>

        <article
          class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4"
        >
          <p
            class="text-xs font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
          >
            Username
          </p>
          <p class="mt-2 text-sm text-[var(--on-surface)]">{{ username }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

watchEffect(() => {
  if (!authStore.isLoggedIn) {
    router.replace("/login");
  }
});

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

const avatarText = computed(() => {
  const source = displayName.value.trim();
  return source ? source.slice(0, 2) : "RL";
});

const phoneNumber = computed(() => {
  return (
    authStore.user?.profile?.DIENTHOAI ||
    authStore.user?.profile?.SoDienThoai ||
    "Chưa cập nhật SĐT"
  );
});

const username = computed(() => {
  return authStore.user?.account?.username || "Không có";
});
</script>
