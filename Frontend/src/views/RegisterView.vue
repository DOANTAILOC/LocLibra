<template>
  <main
    class="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_8%_18%,rgb(214_232_207/30%),transparent_34%),var(--background)] text-[var(--on-surface)] lg:h-screen lg:grid-cols-[1.1fr_1fr]"
  >
    <section
      aria-hidden="true"
      class="relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center bg-no-repeat max-lg:min-h-[32vh]"
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
          Mỗi độc giả mới là một cánh cửa tri thức mở ra.
        </h1>
        <p class="max-w-[44ch] text-[1.05rem] leading-[1.7] text-white/90">
          Tạo tài khoản độc giả để theo dõi lịch sử mượn trả và bắt đầu hành
          trình đọc sách tại LocLibrary.
        </p>
      </div>
    </section>

    <section class="grid place-items-center px-5 py-6 sm:px-8 lg:p-4">
      <div
        class="glass-panel editorial-shadow w-full max-w-[560px] rounded-xl border border-[var(--outline-variant)] p-5 sm:p-6"
      >
        <header class="mb-5">
          <p class="mb-4 font-serif text-[1.3rem] italic text-[var(--primary)]">
            LocLibrary
          </p>
          <h2
            class="mb-2 font-serif text-[clamp(1.8rem,2.5vw,2.5rem)] leading-[1.1] text-[var(--on-surface)]"
          >
            Create reader account
          </h2>
          <p class="text-[0.95rem] text-[var(--on-surface-variant)]">
            Điền thông tin để đăng ký tài khoản độc giả mới
          </p>
        </header>

        <form class="flex flex-col gap-3" @submit.prevent="handleRegister">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                for="phone"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Điện thoại</label
              >
              <input
                id="phone"
                v-model.trim="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                autocomplete="tel"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>

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
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                for="hoLot"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Họ lót</label
              >
              <input
                id="hoLot"
                v-model.trim="hoLot"
                type="text"
                placeholder="Nhập họ lót"
                autocomplete="additional-name"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="ten"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Tên</label
              >
              <input
                id="ten"
                v-model.trim="ten"
                type="text"
                placeholder="Nhập tên"
                autocomplete="given-name"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                for="birthday"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Ngày sinh</label
              >
              <input
                id="birthday"
                v-model="birthday"
                type="date"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="gender"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Phái</label
              >
              <select
                id="gender"
                v-model="gender"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label
              for="address"
              class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
              >Địa chỉ</label
            >
            <input
              id="address"
              v-model.trim="address"
              type="text"
              placeholder="Nhập địa chỉ"
              autocomplete="street-address"
              class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                autocomplete="new-password"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="confirm"
                class="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-surface-variant)]"
                >Xác nhận mật khẩu</label
              >
              <input
                id="confirm"
                v-model="confirm"
                type="password"
                placeholder="Nhập lại mật khẩu"
                autocomplete="new-password"
                class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2.5 text-sm text-[var(--on-surface)] transition focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[rgb(214_232_207/45%)] focus:outline-none"
              />
            </div>
          </div>

          <p
            v-if="error"
            class="rounded-lg border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] px-3 py-2.5 text-[0.9rem] text-[var(--on-error-container)]"
          >
            {{ error }}
          </p>

          <button
            class="mt-1 cursor-pointer rounded-xl border border-transparent bg-gradient-to-br from-[var(--primary)] to-[var(--on-primary-fixed-variant)] px-4 py-3 text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[var(--on-primary)] transition hover:-translate-y-px hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? "Đang đăng kí..." : "Đăng ký tài khoản" }}
          </button>

          <p class="mt-1 text-[0.9rem] text-[var(--on-surface-variant)]">
            Đã có tài khoản?
            <RouterLink
              to="/login"
              class="ml-1.5 font-semibold text-[var(--primary)] hover:underline"
              >Đăng nhập ngay</RouterLink
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

const hoLot = ref("");
const ten = ref("");
const birthday = ref("");
const gender = ref("");
const address = ref("");
const phone = ref("");
const username = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const error = ref("");

async function handleRegister() {
  if (!hoLot.value || !ten.value || !username.value || !password.value) {
    error.value = "Vui lòng nhập các trường bắt buộc";
    return;
  }
  if (password.value !== confirm.value) {
    error.value = "Mật khẩu xác nhận không khớp";
    return;
  }
  try {
    loading.value = true;
    error.value = "";
    await authStore.registerReader({
      HOLOT: hoLot.value,
      TEN: ten.value,
      NGAYSINH: birthday.value || undefined,
      PHAI: gender.value || undefined,
      DIACHI: address.value || undefined,
      DIENTHOAI: phone.value || undefined,
      username: username.value,
      password: password.value,
    });
  } catch (err) {
    error.value = err.response?.data?.message || "Đăng ký thất bại";
  } finally {
    loading.value = false;
  }
}
</script>
