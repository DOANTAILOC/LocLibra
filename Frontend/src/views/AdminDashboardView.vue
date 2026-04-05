<template>
  <div
    class="admin-page min-h-screen bg-[var(--background)] text-[var(--on-surface)]"
  >
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/35 lg:hidden"
      @click="mobileMenuOpen = false"
    ></div>

    <AdminSidebar
      :mobile-open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
    />

    <main class="min-h-screen lg:ml-72">
      <header
        class="sticky top-0 z-30 flex items-center justify-between border-b border-[rgb(184_188_163/20%)] bg-[rgb(254_253_241/82%)] px-4 py-4 backdrop-blur-md md:px-8"
      >
        <div class="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(184_188_163/55%)] bg-white/70 lg:hidden"
            @click="mobileMenuOpen = true"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>

          <div class="relative hidden md:block">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--on-surface-variant)]"
            >
              search
            </span>
            <input
              type="text"
              class="w-80 rounded-xl border border-transparent bg-[var(--surface-container-highest)] py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[var(--outline-variant)]"
              placeholder="Tìm sách, thành viên, mã mượn..."
            />
          </div>
        </div>

        <div class="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            class="relative rounded-full p-2.5 text-[var(--primary)] transition hover:bg-[var(--surface-container)]"
          >
            <span class="material-symbols-outlined">notifications</span>
            <span
              class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-[var(--surface)] bg-[var(--error)]"
            ></span>
          </button>

          <div class="h-8 w-px bg-[rgb(184_188_163/45%)]"></div>

          <div class="flex items-center gap-3">
            <div class="hidden text-right sm:block">
              <p class="text-sm font-semibold">Admin Curator</p>
              <p
                class="text-[10px] font-bold tracking-[0.16em] text-[var(--on-surface-variant)] uppercase"
              >
                Senior Librarian
              </p>
            </div>
            <div
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)]"
            >
              AC
            </div>
          </div>
        </div>
      </header>

      <section class="px-4 pt-7 pb-12 md:px-8">
        <div
          class="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <h2
              class="text-3xl leading-tight font-light text-slate-900 md:text-4xl"
            >
              Tổng quan Thư viện
            </h2>
            <p class="mt-2 max-w-xl text-[var(--on-surface-variant)]">
              Chào mừng trở lại. Hệ thống đang theo dõi trạng thái mượn trả, xử
              lý nhắc hạn và tổng hợp hành vi đọc theo thời gian thực.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="btn-secondary px-5 py-3 text-xs uppercase"
            >
              <span class="material-symbols-outlined mr-1 text-[18px]"
                >add_circle</span
              >
              Thêm sách mới
            </button>
            <button
              type="button"
              class="btn-primary px-5 py-3 text-xs uppercase"
            >
              <span class="material-symbols-outlined mr-1 text-[18px]"
                >update</span
              >
              Gia hạn sách
            </button>
          </div>
        </div>

        <div class="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-xl border border-transparent bg-[var(--surface-container-lowest)] p-6 shadow-[0_12px_40px_rgb(54_58_39/6%)] transition hover:border-[rgb(184_188_163/45%)]"
          >
            <div class="mb-4 flex items-start justify-between">
              <div class="rounded-lg p-3" :class="stat.iconSurface">
                <span class="material-symbols-outlined">{{ stat.icon }}</span>
              </div>
              <span
                class="rounded-full px-2 py-1 text-[10px] font-bold uppercase"
                :class="stat.badgeClass"
              >
                {{ stat.badge }}
              </span>
            </div>
            <p
              class="mb-1 text-[10px] font-bold tracking-[0.14em] text-[var(--on-surface-variant)] uppercase"
            >
              {{ stat.label }}
            </p>
            <h3 class="text-3xl font-semibold">{{ stat.value }}</h3>
          </article>
        </div>

        <section
          class="overflow-hidden rounded-xl bg-[var(--surface-container-lowest)] shadow-[0_12px_40px_rgb(54_58_39/6%)]"
        >
          <div
            class="flex items-center justify-between border-b border-[rgb(184_188_163/25%)] px-5 py-4 md:px-8"
          >
            <h3 class="text-xl">Hoạt động mượn sách gần đây</h3>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-lg p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)]"
              >
                <span class="material-symbols-outlined">filter_list</span>
              </button>
              <button
                type="button"
                class="rounded-lg p-2 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)]"
              >
                <span class="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[760px] w-full border-collapse text-left">
              <thead>
                <tr class="bg-[rgb(250_250_235/70%)]">
                  <th
                    class="px-5 py-4 text-[10px] tracking-[0.14em] text-[var(--on-surface-variant)] uppercase md:px-8"
                  >
                    Tên sách
                  </th>
                  <th
                    class="px-5 py-4 text-[10px] tracking-[0.14em] text-[var(--on-surface-variant)] uppercase md:px-8"
                  >
                    Người mượn
                  </th>
                  <th
                    class="px-5 py-4 text-[10px] tracking-[0.14em] text-[var(--on-surface-variant)] uppercase md:px-8"
                  >
                    Ngày mượn
                  </th>
                  <th
                    class="px-5 py-4 text-[10px] tracking-[0.14em] text-[var(--on-surface-variant)] uppercase md:px-8"
                  >
                    Trả dự kiến
                  </th>
                  <th
                    class="px-5 py-4 text-[10px] tracking-[0.14em] text-[var(--on-surface-variant)] uppercase md:px-8"
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[rgb(184_188_163/20%)]">
                <tr
                  v-for="row in recentBorrowRows"
                  :key="row.memberId"
                  class="transition hover:bg-[rgb(250_250_235/50%)]"
                >
                  <td class="px-5 py-5 md:px-8">
                    <p class="font-semibold">{{ row.book }}</p>
                    <p class="text-xs text-[var(--on-surface-variant)]">
                      {{ row.author }}
                    </p>
                  </td>
                  <td class="px-5 py-5 md:px-8">
                    <p class="text-sm font-medium">{{ row.member }}</p>
                    <p class="text-[10px] text-[var(--on-surface-variant)]">
                      ID: {{ row.memberId }}
                    </p>
                  </td>
                  <td
                    class="px-5 py-5 text-sm text-[var(--on-surface-variant)] md:px-8"
                  >
                    {{ row.borrowedAt }}
                  </td>
                  <td
                    class="px-5 py-5 text-sm md:px-8"
                    :class="
                      row.status === 'overdue'
                        ? 'font-bold text-[var(--error)]'
                        : 'text-[var(--on-surface-variant)]'
                    "
                  >
                    {{ row.dueAt }}
                  </td>
                  <td class="px-5 py-5 md:px-8">
                    <span
                      class="status-chip"
                      :class="borrowStatusClass(row.status)"
                    >
                      {{ row.statusLabel }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="flex items-center justify-between border-t border-[rgb(184_188_163/20%)] bg-[rgb(250_250_235/40%)] px-5 py-4 md:px-8"
          >
            <p class="text-xs italic text-[var(--on-surface-variant)]">
              Hiển thị 3 trên 1,245 bản ghi
            </p>
            <div class="flex gap-1">
              <button
                type="button"
                class="h-8 w-8 rounded-lg text-xs hover:bg-[var(--surface-container)]"
              >
                1
              </button>
              <button
                type="button"
                class="h-8 w-8 rounded-lg bg-[var(--primary)] text-xs font-bold text-[var(--on-primary)]"
              >
                2
              </button>
              <button
                type="button"
                class="h-8 w-8 rounded-lg text-xs hover:bg-[var(--surface-container)]"
              >
                3
              </button>
            </div>
          </div>
        </section>

        <div class="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article
            class="relative overflow-hidden rounded-2xl bg-[rgb(83_99_79/9%)] p-7 xl:col-span-2"
          >
            <div
              class="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center"
            >
              <div class="max-w-md">
                <h4 class="text-2xl text-[var(--primary)]">
                  Mở rộng kho lưu trữ kỹ thuật số
                </h4>
                <p class="mt-3 text-[var(--on-surface-variant)]">
                  Đồng bộ thêm 500+ đầu sách điện tử từ đối tác để mở rộng trải
                  nghiệm đọc trên nền tảng LocLibrary.
                </p>
                <button
                  type="button"
                  class="btn-primary mt-6 px-6 py-3 text-xs"
                >
                  Kích hoạt đồng bộ
                </button>
              </div>

              <div
                class="flex h-40 w-40 items-center justify-center rounded-full border border-white/70 bg-white/50"
              >
                <span
                  class="material-symbols-outlined text-6xl text-[var(--primary)]"
                  style="font-variation-settings: &quot;FILL&quot; 1"
                >
                  cloud_sync
                </span>
              </div>
            </div>
            <div
              class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl"
            ></div>
          </article>

          <article
            class="flex flex-col items-center justify-center rounded-2xl border border-[rgb(184_188_163/30%)] bg-[var(--surface-container-high)] p-7 text-center"
          >
            <div
              class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-inner"
            >
              <span
                class="material-symbols-outlined text-3xl text-[var(--primary)]"
              >
                qr_code_scanner
              </span>
            </div>
            <h4 class="text-xl">Trả sách siêu tốc</h4>
            <p class="mt-2 text-sm text-[var(--on-surface-variant)]">
              Quét QR trên thẻ thành viên để cập nhật trạng thái trả ngay lập
              tức.
            </p>
            <button
              type="button"
              class="mt-6 w-full rounded-xl border-2 border-dashed border-[rgb(83_99_79/35%)] py-3 text-sm font-bold text-[var(--primary)] transition hover:bg-white/50"
            >
              Bắt đầu quét
            </button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AdminSidebar from "../components/admin/AdminSidebar.vue";

const mobileMenuOpen = ref(false);

const stats = [
  {
    label: "Tổng số sách",
    value: "15,420",
    icon: "menu_book",
    badge: "+2.4%",
    iconSurface:
      "bg-[var(--primary-container)] text-[var(--on-primary-container)]",
    badgeClass: "bg-[var(--primary-container)]/60 text-[var(--primary)]",
  },
  {
    label: "Sách đang mượn",
    value: "1,245",
    icon: "outbound",
    badge: "Hiện tại",
    iconSurface:
      "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
    badgeClass: "bg-[var(--secondary-container)] text-[var(--secondary)]",
  },
  {
    label: "Thành viên mới",
    value: "86",
    icon: "person_add",
    badge: "Tháng này",
    iconSurface:
      "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]",
    badgeClass: "bg-[var(--tertiary-container)] text-[var(--tertiary)]",
  },
  {
    label: "Yêu cầu chờ",
    value: "12",
    icon: "pending_actions",
    badge: "Cần xử lý",
    iconSurface: "bg-[rgb(254_139_112/25%)] text-[var(--error)]",
    badgeClass: "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]",
  },
];

const recentBorrowRows = [
  {
    book: "Lược Sử Thời Gian",
    author: "Stephen Hawking",
    member: "Nguyễn Văn An",
    memberId: "#MEM-4501",
    borrowedAt: "12/10/2023",
    dueAt: "26/10/2023",
    status: "borrowing",
    statusLabel: "Đang mượn",
  },
  {
    book: "Tiếng Chim Hót Trong Bụi Mận Gai",
    author: "Colleen McCullough",
    member: "Trần Thị Bé",
    memberId: "#MEM-2293",
    borrowedAt: "01/10/2023",
    dueAt: "15/10/2023",
    status: "overdue",
    statusLabel: "Quá hạn",
  },
  {
    book: "Những Kẻ Xuất Chúng",
    author: "Malcolm Gladwell",
    member: "Lê Hoàng Nam",
    memberId: "#MEM-9810",
    borrowedAt: "05/10/2023",
    dueAt: "19/10/2023",
    status: "returned",
    statusLabel: "Đã trả",
  },
];

function borrowStatusClass(status) {
  if (status === "overdue") return "status-chip-overdue";
  if (status === "returned") return "status-chip-returned";
  return "status-chip-active";
}
</script>
