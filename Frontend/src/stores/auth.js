import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/axios";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(
    () => user.value?.role === "staff" || user.value?.role === "admin",
  );
  const isReader = computed(() => user.value?.role === "reader");

  function saveAuth(data) {
    const normalizedUser = {
      role: data.role,
      account: data.account || null,
      profile: data.profile || null,
    };

    token.value = data.token;
    user.value = normalizedUser;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  }

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    saveAuth(res.data);
    router.push(res.data.redirectPath || "/");
  }

  async function registerReader(payload) {
    const res = await api.post("/auth/register/reader", payload);
    saveAuth(res.data);
    router.push(res.data.redirectPath || "/");
  }

  async function registerStaff(payload) {
    const res = await api.post("/auth/register/staff", payload);
    saveAuth(res.data);
    router.push(res.data.redirectPath || "/");
  }

  async function verifyAuth() {
    if (!token.value) return false;

    try {
      const res = await api.get("/auth/verify");

      user.value = {
        role: res.data.role,
        account: res.data.account || null,
        profile: res.data.profile || null,
      };
      localStorage.setItem("user", JSON.stringify(user.value));

      return true;
    } catch {
      logout(false);
      return false;
    }
  }

  function logout(redirect = true) {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (redirect) {
      router.push("/login");
    }
  }

  function setProfile(profile) {
    if (!user.value) return;

    user.value = {
      ...user.value,
      profile: profile || null,
    };
    localStorage.setItem("user", JSON.stringify(user.value));
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isReader,
    login,
    registerReader,
    registerStaff,
    verifyAuth,
    logout,
    setProfile,
  };
});
