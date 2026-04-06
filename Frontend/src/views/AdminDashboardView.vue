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

    <main class="flex min-h-screen flex-1 flex-col lg:ml-72">
      <AdminTopHeader @open-menu="mobileMenuOpen = true" />

      <section class="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <AdminPageHero
          title="Tổng quan Thư viện"
          description="Theo dõi số lượng sách, trạng thái mượn trả và hoạt động gần đây theo dữ liệu thật từ hệ thống."
        >
          <template #actions>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-[var(--surface-container-highest)] px-5 py-2 text-sm font-semibold"
              @click="router.push('/admin/books')"
            >
              <span class="material-symbols-outlined text-[18px]"
                >add_circle</span
              >
              Thêm sách mới
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="fetchDashboardSummary"
            >
              <span class="material-symbols-outlined text-[18px]">refresh</span>
              Làm mới
            </button>
          </template>
        </AdminPageHero>

        <FeedbackAlert :message="errorMessage" type="error" />

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

        <AdminTableShell
          :loading="loading"
          :empty="!loading && recentBorrowRows.length === 0"
          :colspan="5"
          loading-text="Đang tải dữ liệu hoạt động mượn..."
          empty-text="Chưa có hoạt động mượn nào gần đây."
          min-width-class="min-w-[760px]"
          :total-text="activityTotalText"
        >
          <template #head>
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
          </template>

          <template #rows>
            <tr
              v-for="row in recentBorrowRows"
              :key="row.id"
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
                {{ formatDate(row.borrowedAt) }}
              </td>
              <td
                class="px-5 py-5 text-sm md:px-8"
                :class="
                  row.status === 'overdue'
                    ? 'font-bold text-[var(--error)]'
                    : 'text-[var(--on-surface-variant)]'
                "
              >
                {{ formatDate(row.dueAt) }}
              </td>
              <td class="px-5 py-5 md:px-8">
                <StatusChip
                  :label="row.statusLabel"
                  :custom-class="borrowStatusClass(row.status)"
                />
              </td>
            </tr>
          </template>

          <template #footer>
            <button
              type="button"
              class="rounded-lg bg-[var(--surface-container-highest)] px-3 py-1.5 text-xs font-semibold text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
              @click="fetchDashboardSummary"
            >
              Làm mới bảng
            </button>
          </template>
        </AdminTableShell>

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
                  :style="{ fontVariationSettings: '&quot;FILL&quot; 1' }"
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AdminSidebar from "../components/admin/AdminSidebar.vue";
import AdminPageHero from "../components/admin/shared/AdminPageHero.vue";
import AdminTableShell from "../components/admin/shared/AdminTableShell.vue";
import AdminTopHeader from "../components/admin/shared/AdminTopHeader.vue";
import FeedbackAlert from "../components/admin/shared/FeedbackAlert.vue";
import StatusChip from "../components/admin/shared/StatusChip.vue";
import api from "../api/axios";

const router = useRouter();
const mobileMenuOpen = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const summary = reactive({
  stats: {
    totalBooks: 0,
    totalTitles: 0,
    activeBorrowCount: 0,
    newMembersThisMonth: 0,
    pendingRequests: 0,
    totalBorrowRecords: 0,
  },
  recentBorrowRows: [],
});

const stats = computed(() => [
  {
    label: "Tổng đầu sách",
    value: formatNumber(summary.stats.totalTitles),
    icon: "menu_book",
    badge: `${formatNumber(summary.stats.totalBooks)} bản sách`,
    iconSurface:
      "bg-[var(--primary-container)] text-[var(--on-primary-container)]",
    badgeClass: "bg-[var(--primary-container)]/60 text-[var(--primary)]",
  },
  {
    label: "Sách đang mượn",
    value: formatNumber(summary.stats.activeBorrowCount),
    icon: "outbound",
    badge: "Hiện tại",
    iconSurface:
      "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
    badgeClass: "bg-[var(--secondary-container)] text-[var(--secondary)]",
  },
  {
    label: "Thành viên mới",
    value: formatNumber(summary.stats.newMembersThisMonth),
    icon: "person_add",
    badge: "Tháng này",
    iconSurface:
      "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]",
    badgeClass: "bg-[var(--tertiary-container)] text-[var(--tertiary)]",
  },
  {
    label: "Yêu cầu chờ",
    value: formatNumber(summary.stats.pendingRequests),
    icon: "pending_actions",
    badge: "Cần xử lý",
    iconSurface: "bg-[rgb(254_139_112/25%)] text-[var(--error)]",
    badgeClass: "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]",
  },
]);

const recentBorrowRows = computed(() => summary.recentBorrowRows || []);
const activityTotalText = computed(
  () =>
    `Hiển thị ${recentBorrowRows.value.length} trên ${formatNumber(summary.stats.totalBorrowRecords)} bản ghi`,
);

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

async function fetchDashboardSummary() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await api.get("/admin/dashboard-summary");
    summary.stats = {
      ...summary.stats,
      ...(data?.stats || {}),
    };
    summary.recentBorrowRows = Array.isArray(data?.recentBorrowRows)
      ? data.recentBorrowRows
      : [];
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể tải dữ liệu dashboard từ máy chủ.";
  } finally {
    loading.value = false;
  }
}

function borrowStatusClass(status) {
  if (status === "extension_pending") return "status-chip-draft";
  if (status === "pending") return "status-chip-draft";
  if (status === "approved") return "status-chip-draft";
  if (status === "overdue") return "status-chip-overdue";
  if (status === "lost") return "status-chip-overdue";
  if (status === "returned") return "status-chip-returned";
  if (status === "rejected") return "status-chip-overdue";
  if (status === "cancelled") return "status-chip-draft";
  return "status-chip-active";
}

onMounted(fetchDashboardSummary);
</script>
