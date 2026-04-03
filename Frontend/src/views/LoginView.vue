<template>
  <main
    class="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_8%_18%,rgb(214_232_207/30%),transparent_34%),var(--background)] text-[var(--on-surface)] lg:grid-cols-[1.1fr_1fr]"
  >
    <section
      aria-hidden="true"
      class="relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center bg-no-repeat max-lg:min-h-[32vh]"
    >
      <div class="absolute inset-0 bg-white/30"></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/28 to-black/8"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(214_232_207/24%),transparent_48%)]"
      ></div>
      <div
        class="relative z-10 flex h-full max-w-[560px] flex-col justify-end px-6 py-10 text-[var(--on-primary)] sm:px-8 md:px-12 md:py-16"
      >
        <h1
          class="mb-4 font-serif text-[clamp(2rem,3.8vw,3.8rem)] leading-[1.15] !text-white"
        >
          Sách là kho tàng tri thức của nhân loại.
        </h1>
        <p class="max-w-[44ch] text-[1.05rem] leading-[1.7] text-white/90">
        Đọc sách mỗi ngày để gìn giữ sự tiếp nối của tư duy.
        </p>
      </div>
    </section>

    <section class="grid place-items-center px-5 py-8 sm:px-8 lg:p-8">
      <div
        class="glass-panel editorial-shadow w-full max-w-[430px] rounded-xl border border-[var(--outline-variant)] p-6 sm:p-8"
      >
        <header class="mb-8">
          <p class="mb-8 font-serif text-[1.3rem] italic text-[var(--primary)]">
            LocLibrary
          </p>
          <h2
            class="mb-2 font-serif text-[clamp(1.8rem,2.5vw,2.5rem)] leading-[1.1] text-[var(--on-surface)]"
          >
            Welcome back
          </h2>
          <p class="text-[0.95rem] text-[var(--on-surface-variant)]">
            Sử dụng username và mật khẩu đã được cấp
          </p>
        </header>

        <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
          <div class="flex flex-col gap-2">
            <label
              for="username"
              class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
              >Username</label
            >
            <input
              id="username"
              v-model.trim="username"
              type="text"
              placeholder="Nhập username"
              autocomplete="username"
              class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-3 text-base text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label
              for="password"
              class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
              >Mật khẩu</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhập mật khẩu"
              autocomplete="current-password"
              class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-3 text-base text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
            />
          </div>

          <p
            v-if="error"
            class="rounded-lg border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] px-3 py-2.5 text-[0.9rem] text-[var(--on-error-container)]"
          >
            {{ error }}
          </p>

          <button
            class="mt-1 cursor-pointer rounded-xl border border-transparent bg-gradient-to-br from-[var(--primary)] to-[var(--on-primary-fixed-variant)] px-4 py-4 text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-primary)] transition hover:-translate-y-px hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? "Dang dang nhap..." : "Đăng nhập" }}
          </button>

          <p class="mt-1 text-[0.9rem] text-[var(--on-surface-variant)]">
            Chưa có tài khoản?
            <RouterLink
              to="/register"
              class="ml-1.5 font-semibold text-[var(--primary)] hover:underline"
              >Đăng kí tài khoản độc giả</RouterLink
            >
          </p>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = "Vui long nhap day du username va mat khau";
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    await authStore.login(username.value, password.value);
  } catch (err) {
    error.value = err.response?.data?.message || "Dang nhap that bai";
  } finally {
    loading.value = false;
  }
}
</script>
