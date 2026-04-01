<template>
  <header
    class="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-primary/10 shadow-sm"
  >
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <span class="material-icons text-primary text-3xl">auto_stories</span>
        <span
          class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-50 uppercase"
        >
          Thư Viện <span class="text-primary">Cộng Đồng</span>
        </span>
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8">
        <a
          v-for="item in navItems"
          :key="item.label"
          href="#"
          :class="[
            'transition-colors',
            item.active
              ? 'text-primary font-semibold'
              : 'text-text-muted dark:text-slate-300 hover:text-primary',
          ]"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Auth Buttons -->
      <div class="flex items-center gap-4">
        <button
          class="px-5 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
        >
          Đăng Nhập
        </button>
        <button
          class="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
        >
          Đăng Ký
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const navItems = [
  { label: "Trang Chủ", active: true },
  { label: "Về Chúng Tôi", active: false },
  { label: "Tủ Sách", active: false },
  { label: "Mượn của tôi", active: false },
];
</script>
