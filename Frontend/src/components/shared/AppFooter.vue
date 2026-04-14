<template>
  <footer
    class="border-t border-[rgb(184_188_163/30%)] bg-[var(--surface)] py-8"
  >
    <div
      class="container mx-auto grid grid-cols-1 gap-6 px-4 text-sm text-[var(--on-surface-variant)] md:grid-cols-3"
    >
      <div class="space-y-2">
        <p
          class="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase"
        >
          LocLibrary
        </p>
        <p class="max-w-xs">
          Nền tảng quản lý thư viện số giúp bạn khám phá, theo dõi và mượn sách
          nhanh chóng.
        </p>
      </div>

      <div class="space-y-2">
        <p class="font-bold text-[var(--on-surface)]">Liên kết nhanh</p>
        <RouterLink
          to="/books"
          class="block transition hover:text-[var(--primary)]"
        >
          Kho sách
        </RouterLink>
        <RouterLink
          to="/my-loans"
          class="block transition hover:text-[var(--primary)]"
        >
          Sách đang mượn
        </RouterLink>
        <RouterLink
          to="/my-profile"
          class="block transition hover:text-[var(--primary)]"
        >
          Hồ sơ cá nhân
        </RouterLink>
      </div>

      <div class="space-y-2">
        <p class="font-bold text-[var(--on-surface)]">Thông tin</p>
        <p>Email: support@loclibrary.vn</p>
        <p>Điện thoại: 0292 3 123 456</p>
        <p>Địa chỉ: Ninh Kiều, Cần Thơ</p>
      </div>
    </div>
    <p class="mt-5 text-center text-xs text-[var(--text-muted)]">
      Bản quyền {{ new Date().getFullYear() }} LocLibrary. All rights reserved.
    </p>
  </footer>
</template>
