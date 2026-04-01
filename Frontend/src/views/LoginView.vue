<template>
  <main class="login-page">
    <section class="visual-panel" aria-hidden="true">
      <div class="visual-overlay"></div>
      <div class="visual-content">
        <h1>Tri thuc duoc quan ly he thong.</h1>
        <p>
          Dang nhap de truy cap kho sach, lich su muon tra va cac cong cu quan
          tri thu vien.
        </p>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-wrap">
        <header class="form-header">
          <p class="brand">LocLibrary</p>
          <h2>Dang nhap he thong</h2>
          <p class="subtitle">Su dung username va mat khau da duoc cap.</p>
        </header>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="field-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model.trim="username"
              type="text"
              placeholder="Nhap username"
              autocomplete="username"
            />
          </div>

          <div class="field-group">
            <label for="password">Mat khau</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Nhap mat khau"
              autocomplete="current-password"
            />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? "Dang dang nhap..." : "Dang nhap" }}
          </button>

          <p class="register-link">
            Chua co tai khoan?
            <RouterLink to="/register">Dang ky tai khoan doc gia</RouterLink>
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

<style scoped>
:global(body) {
  margin: 0;
}

.login-page {
  --surface: #f7f4ed;
  --ink: #2f3a2d;
  --ink-soft: #5f6b5a;
  --brand: #4a5d45;
  --brand-soft: #879882;
  --line: #bdc6b9;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: var(--surface);
  color: var(--ink);
}

.visual-panel {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(34, 46, 32, 0.2), rgba(34, 46, 32, 0.72)),
    url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80")
      center/cover no-repeat;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 20% 20%,
    rgba(203, 215, 195, 0.26),
    transparent 45%
  );
}

.visual-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  padding: 6rem 4rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.visual-content h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 3.8vw, 3.8rem);
  line-height: 1.15;
  margin: 0 0 1rem;
}

.visual-content p {
  margin: 0;
  max-width: 44ch;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.form-panel {
  display: grid;
  place-items: center;
  padding: 2rem;
}

.form-wrap {
  width: 100%;
  max-width: 430px;
}

.form-header {
  margin-bottom: 2rem;
}

.brand {
  margin: 0 0 2.5rem;
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  color: var(--brand);
  font-size: 1.3rem;
}

.form-header h2 {
  margin: 0 0 0.6rem;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.8rem, 2.5vw, 2.5rem);
  line-height: 1.1;
}

.subtitle {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field-group label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
  font-weight: 700;
}

.field-group input {
  border: none;
  border-bottom: 1px solid var(--line);
  background: transparent;
  padding: 0.65rem 0.2rem;
  font-size: 1rem;
  color: var(--ink);
  transition: border-color 0.2s ease;
}

.field-group input:focus {
  outline: none;
  border-color: var(--brand-soft);
}

.error-msg {
  margin: 0.1rem 0;
  color: #bd3131;
  font-size: 0.9rem;
}

.submit-btn {
  margin-top: 0.65rem;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  padding: 0.95rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--brand-soft), var(--brand));
  transition:
    transform 0.18s ease,
    filter 0.18s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  margin: 0.45rem 0 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.register-link a {
  color: var(--brand);
  margin-left: 0.35rem;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 980px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .visual-panel {
    min-height: 32vh;
  }

  .visual-content {
    padding: 2.5rem 1.5rem;
  }

  .form-panel {
    padding: 2rem 1.2rem 3rem;
  }
}
</style>
