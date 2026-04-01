
<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const error = ref("");

async function handleRegister() {
  if (!name.value || !email.value || !password.value) {
    error.value = "Vui lòng nhập đủ thông tin";
    return;
  }
  if (password.value !== confirm.value) {
    error.value = "Mật khẩu xác nhận không khớp";
    return;
  }
  try {
    loading.value = true;
    error.value = "";
    await authStore.register(name.value, email.value, password.value);
  } catch (err) {
    error.value = err.response?.data?.message || "Đăng ký thất bại";
  } finally {
    loading.value = false;
  }
}
</script>
