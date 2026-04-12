<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center justify-between bg-[var(--background)] px-4 md:px-8"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(184_188_163/45%)] lg:hidden"
        @click="$emit('open-menu')"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>

    <div class="flex items-center gap-4 text-[var(--primary)]">
      <button
        type="button"
        class="rounded-full p-2 transition hover:bg-[var(--surface-container)]"
      >
        <span class="material-symbols-outlined">notifications</span>
      </button>
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] transition hover:border-[var(--primary)]"
        @click="goToProfile"
      >
        <img
          v-if="headerAvatar"
          :src="headerAvatar"
          alt="Avatar"
          class="h-full w-full object-cover"
        />
        <span v-else class="text-xs font-bold uppercase text-[var(--primary)]">
          {{ avatarFallback }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

defineProps({
  searchText: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Tìm kiếm...",
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["open-menu", "update:searchText"]);

const headerAvatar = computed(() =>
  String(authStore.user?.profile?.AVATAR_URL || "").trim(),
);

const avatarFallback = computed(() => {
  const fullName = String(authStore.user?.profile?.HoTenNV || "NV").trim();
  return fullName ? fullName.slice(0, 2).toUpperCase() : "NV";
});

function goToProfile() {
  router.push("/admin/profile");
}
</script>
