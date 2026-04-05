<template>
  <aside
    class="fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-[rgb(184_188_163/30%)] bg-[var(--surface-container)] transition-transform duration-300"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div class="p-7">
      <div class="mb-10 flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--on-primary)]"
        >
          <span class="material-symbols-outlined">menu_book</span>
        </div>
        <div>
          <h1 class="text-lg leading-tight font-semibold">LocLibrary Admin</h1>
          <p
            class="text-[10px] font-bold tracking-[0.18em] text-[var(--on-surface-variant)] uppercase"
          >
            Curator Console
          </p>
        </div>
      </div>

      <nav class="space-y-2">
        <template v-for="item in menuItems" :key="item.label">
          <RouterLink
            v-if="item.to"
            :to="item.to"
            class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide uppercase transition"
            :class="
              isActive(item)
                ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
            "
            @click="emit('close')"
          >
            <span class="material-symbols-outlined text-[20px]">{{
              item.icon
            }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>

          <button
            v-else
            type="button"
            class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-wide uppercase text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
          >
            <span class="material-symbols-outlined text-[20px]">{{
              item.icon
            }}</span>
            <span>{{ item.label }}</span>
          </button>
        </template>
      </nav>
    </div>

    <div class="mt-auto border-t border-[rgb(184_188_163/30%)] p-7">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--on-surface-variant)] transition hover:text-[var(--on-surface)]"
        @click="emit('close')"
      >
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        Quay về trang chính
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";

const props = defineProps({
  mobileOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const route = useRoute();

const menuItems = [
  { icon: "dashboard", label: "Dashboard", to: "/admin" },
  { icon: "menu_book", label: "Kho sách", to: "/admin/books" },
  { icon: "domain", label: "Nhà xuất bản", to: "/admin/publishers" },
  { icon: "edit_note", label: "Tác giả", to: "/admin/authors" },
  { icon: "local_offer", label: "Thể loại", to: "/admin/genres" },
  { icon: "badge", label: "Nhân viên", to: "/admin/staffs" },
  { icon: "group", label: "Thành viên", to: "/admin/members" },
  { icon: "history", label: "Lịch sử mượn", to: "/admin/borrows" },
  { icon: "analytics", label: "Báo cáo" },
  { icon: "settings", label: "Cài đặt" },
];

function isActive(item) {
  if (!item.to) return false;
  if (item.to === "/admin") return route.path === "/admin";
  return route.path.startsWith(item.to);
}
</script>
