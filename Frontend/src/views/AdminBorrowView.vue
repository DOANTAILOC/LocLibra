<template>
  <div
    class="flex min-h-screen bg-[var(--background)] text-[var(--on-surface)]"
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
      <AdminTopHeader
        v-model:search-text="searchText"
        placeholder="Tìm phiếu mượn, mã độc giả..."
        @open-menu="mobileMenuOpen = true"
      />

      <div class="flex flex-1 overflow-hidden">
        <section class="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <AdminPageHero
            title="Quản lý Mượn Sách"
            description="Theo dõi trạng thái phiếu mượn, quá hạn và điều phối xử lý tại quầy."
          >
            <template #actions>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--surface-container-highest)] px-5 py-2 text-sm font-semibold"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >file_download</span
                >
                Xuất báo cáo
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading"
                @click="fetchBorrows"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >refresh</span
                >
                Làm mới
              </button>
            </template>
          </AdminPageHero>

          <AdminFilterBar>
            <div class="relative min-w-[240px] flex-1">
              <span
                class="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] leading-none text-[var(--on-surface-variant)]"
              >
                search
              </span>
              <input
                type="text"
                v-model.trim="searchText"
                class="w-full rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-11 pr-4 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Tên thành viên, mã phiếu hoặc mã sách..."
              />
            </div>

            <div class="flex items-center gap-2">
              <select
                v-model="selectedStatus"
                class="cursor-pointer appearance-none rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-3 pr-8 text-xs font-bold text-[var(--on-surface-variant)]"
              >
                <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
                <option value="PENDING">CHỜ DUYỆT</option>
                <option value="APPROVED">ĐÃ DUYỆT</option>
                <option value="BORROWING">ĐANG MƯỢN</option>
                <option value="EXTENSION_PENDING">XIN GIA HẠN</option>
                <option value="OVERDUE">QUÁ HẠN</option>
                <option value="RETURNED">ĐÃ TRẢ</option>
                <option value="LOST">MẤT SÁCH</option>
                <option value="REJECTED">TỪ CHỐI</option>
                <option value="CANCELLED">ĐÃ HỦY</option>
              </select>

              <button
                type="button"
                class="rounded-lg bg-[var(--surface-container-highest)] p-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
                @click="fetchBorrows"
              >
                <span class="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </AdminFilterBar>

          <FeedbackAlert :message="errorMessage" type="error" />
          <FeedbackAlert :message="successMessage" type="success" />

          <AdminTableShell
            :loading="isLoading"
            :empty="!isLoading && filteredRows.length === 0"
            :colspan="6"
            loading-text="Đang tải dữ liệu mượn..."
            empty-text="Không có phiếu mượn phù hợp bộ lọc hiện tại."
            min-width-class="min-w-[860px]"
          >
            <template #head>
              <tr
                class="border-b border-[rgb(184_188_163/20%)] bg-[var(--surface-container-low)]"
              >
                <th
                  class="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Phiếu mượn
                </th>
                <th
                  class="px-4 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Thành viên
                </th>
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Sách
                </th>
                <th
                  class="px-4 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Mượn / Hạn trả
                </th>
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Trạng thái
                </th>
                <th
                  class="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Hành động
                </th>
              </tr>
            </template>
            <template #rows>
              <tr
                v-for="loan in filteredRows"
                :key="loan.id"
                class="group cursor-pointer border-l-4 transition-colors"
                :class="
                  selectedLoan?.id === loan.id
                    ? 'border-l-[var(--primary)] bg-[rgb(83_99_79/4%)]'
                    : 'border-l-transparent hover:bg-[rgb(83_99_79/2%)]'
                "
                @click="selectedLoan = loan"
              >
                <td class="px-6 py-4">
                  <p class="text-sm font-bold">{{ loan.code }}</p>
                  <p class="text-[10px] text-[var(--on-surface-variant)]">
                    {{ loan.createdAt }}
                  </p>
                </td>
                <td class="px-4 py-4">
                  <p class="text-sm font-semibold">{{ loan.memberName }}</p>
                  <p class="text-[11px] text-[var(--on-surface-variant)]">
                    {{ loan.memberId }}
                  </p>
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="text-sm font-bold text-[var(--primary)]">{{
                    1
                  }}</span>
                  <p
                    class="text-[9px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
                  >
                    Đầu sách
                  </p>
                </td>
                <td class="px-4 py-4">
                  <p class="text-xs font-semibold">{{ loan.borrowedAt }}</p>
                  <p
                    class="text-[11px]"
                    :class="
                      loan.status === 'OVERDUE'
                        ? 'font-bold text-[var(--error)]'
                        : 'text-[var(--on-surface-variant)]'
                    "
                  >
                    Hạn: {{ loan.dueAt }}
                  </p>
                </td>
                <td class="px-4 py-4 text-center">
                  <StatusChip
                    :label="loan.statusLabel"
                    :custom-class="statusChipClass(loan.displayStatus)"
                  />
                </td>
                <td class="px-6 py-4 text-right">
                  <div
                    class="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--primary)] transition hover:bg-[rgb(83_99_79/13%)] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="isMutating"
                      @click.stop="runPrimaryAction(loan)"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >bolt</span
                      >
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="isMutating"
                      @click.stop="selectAndSync(loan)"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >more_vert</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <template #footer>
              <p
                class="text-[11px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
              >
                1 - 4 trên 1,245 phiếu mượn
              </p>
              <p
                class="text-[11px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
              >
                Tổng: {{ filteredRows.length }} bản ghi
              </p>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="rounded-md p-1 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)]"
                >
                  <span class="material-symbols-outlined text-sm"
                    >chevron_left</span
                  >
                </button>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-xs font-bold text-[var(--on-primary)]"
                >
                  1
                </button>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)]"
                >
                  2
                </button>
                <button
                  type="button"
                  class="rounded-md p-1 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)]"
                >
                  <span class="material-symbols-outlined text-sm"
                    >chevron_right</span
                  >
                </button>
              </div>
            </template>
          </AdminTableShell>
        </section>

        <AdminDetailAside
          title="Chi tiết phiếu mượn"
          :has-selection="!!selectedLoan"
          empty-text="Chọn một phiếu mượn ở bảng bên trái để xem chi tiết."
        >
          <div
            class="mb-6 rounded-xl bg-[var(--surface-container-lowest)] p-4 shadow-sm"
          >
            <p
              class="text-[10px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
            >
              Mã phiếu
            </p>
            <p class="mt-1 text-lg font-bold text-[var(--primary)]">
              {{ selectedLoan.code || "---" }}
            </p>
            <div class="mt-3 flex items-center justify-between text-xs">
              <span class="text-[var(--on-surface-variant)]">Trạng thái</span>
              <StatusChip
                :label="selectedLoan.statusLabel"
                :custom-class="statusChipClass(selectedLoan.displayStatus)"
              />
            </div>
            <p class="mt-2 text-[11px] text-[var(--on-surface-variant)]">
              Luồng trạng thái: Chờ duyệt -> Đã duyệt -> Đang mượn/Quá hạn -> Đã
              trả
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <p
                class="mb-2 text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                Thành viên
              </p>
              <div
                class="rounded-xl bg-[var(--surface-container-lowest)] p-4 shadow-sm"
              >
                <p class="text-sm font-bold">{{ selectedLoan.memberName }}</p>
                <p class="text-xs text-[var(--on-surface-variant)]">
                  {{ selectedLoan.memberId }}
                </p>
              </div>
            </div>

            <div>
              <p
                class="mb-2 text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                Mốc thời gian
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-xl bg-[var(--surface-container-lowest)] p-3 shadow-sm"
                >
                  <p
                    class="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
                  >
                    Mượn
                  </p>
                  <p class="text-xs font-bold">{{ selectedLoan.borrowedAt }}</p>
                </div>
                <div
                  class="rounded-xl bg-[var(--surface-container-lowest)] p-3 shadow-sm"
                >
                  <p
                    class="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
                  >
                    Hạn trả
                  </p>
                  <p
                    class="text-xs font-bold"
                    :class="
                      selectedLoan.status === 'OVERDUE'
                        ? 'text-[var(--error)]'
                        : ''
                    "
                  >
                    {{ selectedLoan.dueAt }}
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <p
                class="mb-3 text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                Sách mượn
              </p>
              <div class="space-y-2">
                <div
                  v-for="book in selectedLoan.books"
                  :key="book.title"
                  class="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[var(--surface-container-lowest)]"
                >
                  <div
                    class="flex h-10 w-8 items-center justify-center rounded bg-[var(--secondary-container)]"
                  >
                    <span class="material-symbols-outlined text-xs">book</span>
                  </div>
                  <div class="overflow-hidden">
                    <p class="truncate text-[11px] font-bold">
                      {{ book.title }}
                    </p>
                    <p class="text-[9px]" :class="book.noteClass">
                      {{ book.note }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-3">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!nextAction || isMutating"
                @click="runPrimaryAction(selectedLoan)"
              >
                <span class="material-symbols-outlined text-sm">autorenew</span>
                {{ nextActionLabel }}
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(83_99_79/25%)] py-2.5 text-xs font-bold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canReject || isMutating"
                @click="rejectSelected"
              >
                <span class="material-symbols-outlined text-sm">block</span>
                Từ chối phiếu
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(83_99_79/25%)] py-2.5 text-xs font-bold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canApproveExtension || isMutating"
                @click="approveExtensionSelected"
              >
                <span class="material-symbols-outlined text-sm"
                  >event_available</span
                >
                Duyệt gia hạn
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(254_139_112/45%)] py-2.5 text-xs font-bold text-[var(--on-error-container)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canRejectExtension || isMutating"
                @click="rejectExtensionSelected"
              >
                <span class="material-symbols-outlined text-sm"
                  >event_busy</span
                >
                Từ chối gia hạn
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(254_139_112/45%)] py-2.5 text-xs font-bold text-[var(--on-error-container)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canMarkLost || isMutating"
                @click="markSelectedAsLost"
              >
                <span class="material-symbols-outlined text-sm">report</span>
                Báo mất sách
              </button>
            </div>
          </div>
        </AdminDetailAside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import AdminSidebar from "../components/admin/AdminSidebar.vue";
import AdminDetailAside from "../components/admin/shared/AdminDetailAside.vue";
import AdminFilterBar from "../components/admin/shared/AdminFilterBar.vue";
import AdminPageHero from "../components/admin/shared/AdminPageHero.vue";
import AdminTableShell from "../components/admin/shared/AdminTableShell.vue";
import AdminTopHeader from "../components/admin/shared/AdminTopHeader.vue";
import FeedbackAlert from "../components/admin/shared/FeedbackAlert.vue";
import StatusChip from "../components/admin/shared/StatusChip.vue";
import api from "../api/axios";

const mobileMenuOpen = ref(false);
const isLoading = ref(false);
const isMutating = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const searchText = ref("");
const selectedStatus = ref("ALL");
const rawBorrows = ref([]);
const selectedLoan = ref(null);

const statusLabelMap = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  BORROWING: "Đang mượn",
  EXTENSION_PENDING: "Xin gia hạn",
  OVERDUE: "Quá hạn",
  RETURNED: "Đã trả",
  LOST: "Mất sách",
  CANCELLED: "Đã hủy",
};

const filteredRows = computed(() => {
  const keyword = searchText.value.toLowerCase();

  return rawBorrows.value.filter((item) => {
    if (
      selectedStatus.value !== "ALL" &&
      item.displayStatus !== selectedStatus.value
    ) {
      return false;
    }

    if (!keyword) return true;

    return [
      item.code,
      item.memberName,
      item.memberId,
      item.bookTitle,
      item.bookCode,
      item.statusLabel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
});

const nextAction = computed(() => {
  const status = selectedLoan.value?.status;
  if (status === "PENDING") return "approve";
  if (status === "APPROVED") return "hand-over";
  if (["BORROWING", "OVERDUE"].includes(status)) return "return";
  if (
    ["RETURNED", "LOST"].includes(status) &&
    selectedLoan.value?.fineStatus === "UNPAID"
  ) {
    return "pay-fine";
  }
  return null;
});

const nextActionLabel = computed(() => {
  if (nextAction.value === "approve") return "Duyệt phiếu";
  if (nextAction.value === "hand-over") return "Giao sách";
  if (nextAction.value === "return") return "Nhận trả sách";
  if (nextAction.value === "pay-fine") return "Thu tiền phạt";
  return "Không có thao tác";
});

const canReject = computed(() => selectedLoan.value?.status === "PENDING");
const canMarkLost = computed(() =>
  ["BORROWING", "OVERDUE"].includes(selectedLoan.value?.status),
);
const canApproveExtension = computed(
  () => selectedLoan.value?.extensionRequestStatus === "PENDING",
);
const canRejectExtension = computed(
  () => selectedLoan.value?.extensionRequestStatus === "PENDING",
);

watch(filteredRows, (rows) => {
  if (!rows.length) {
    selectedLoan.value = null;
    return;
  }

  if (!selectedLoan.value) {
    selectedLoan.value = rows[0];
    return;
  }

  const stillExists = rows.find((item) => item.id === selectedLoan.value.id);
  if (!stillExists) {
    selectedLoan.value = rows[0];
  }
});

function formatDate(dateValue) {
  if (!dateValue) return "---";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "---";
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatBorrowItem(item) {
  const displayStatus =
    item.TRANGTHAI_GIA_HAN === "PENDING" ? "EXTENSION_PENDING" : item.TRANGTHAI;

  return {
    id: item._id,
    code: `PM-${item._id.slice(-6).toUpperCase()}`,
    createdAt: `Tạo: ${formatDate(item.NGAYYEUCAU || item.created_at)}`,
    memberName: item.DOCGIA?.HOTEN || "Không rõ độc giả",
    memberId: item.MADOCGIA || item.DOCGIA?.MADOCGIA || "---",
    bookCode: item.MASACH || item.SACH?.MASACH || "---",
    bookTitle: item.SACH?.TENSACH || "Chưa có tên sách",
    borrowedAt: formatDate(item.NGAYMUON || item.NGAYYEUCAU),
    dueAt: formatDate(item.NGAYHENTRA),
    status: item.TRANGTHAI,
    displayStatus,
    statusLabel:
      statusLabelMap[displayStatus] ||
      statusLabelMap[item.TRANGTHAI] ||
      item.TRANGTHAI,
    fineAmount: item.TIENPHAT || 0,
    fineStatus: item.TRANGTHAI_PHAT || "PAID",
    extensionCount: Number(item.SO_LAN_GIA_HAN || 0),
    extensionRequestStatus: item.TRANGTHAI_GIA_HAN || "NONE",
    books: [
      {
        title: item.SACH?.TENSACH || item.MASACH || "Chưa có tên sách",
        note:
          item.TRANGTHAI_GIA_HAN === "PENDING"
            ? "Có yêu cầu gia hạn đang chờ duyệt"
            : item.TRANGTHAI === "LOST"
              ? `Đền bù: ${(item.TIENPHAT || 0).toLocaleString("vi-VN")} VND`
              : item.TRANGTHAI === "OVERDUE"
                ? `Trễ ${item.SONGAYTRE || 0} ngày`
                : `Mã sách: ${item.SACH?.MASACH || item.MASACH || "---"}`,
        noteClass:
          item.TRANGTHAI_GIA_HAN === "PENDING"
            ? "text-[var(--primary)] font-medium"
            : item.TRANGTHAI === "OVERDUE" || item.TRANGTHAI === "LOST"
              ? "text-[var(--error)] font-medium"
              : "text-[var(--on-surface-variant)]",
      },
    ],
  };
}

function normalizeError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Có lỗi xảy ra, vui lòng thử lại"
  );
}

async function fetchBorrows() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const query =
      selectedStatus.value !== "ALL" ? `?status=${selectedStatus.value}` : "";
    const response = await api.get(`/borrows${query}`);
    rawBorrows.value = (response.data?.items || []).map(formatBorrowItem);
    if (!selectedLoan.value && rawBorrows.value.length) {
      selectedLoan.value = rawBorrows.value[0];
    }
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isLoading.value = false;
  }
}

function selectAndSync(loan) {
  selectedLoan.value = loan;
  successMessage.value = "";
}

async function updateBorrowStatus(loan, action, payload = {}) {
  if (!loan?.id) return;

  isMutating.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const endpoint = `/borrows/${loan.id}/${action}`;
    const response = await api.patch(endpoint, payload);
    successMessage.value =
      response.data?.message || "Cập nhật trạng thái thành công";
    await fetchBorrows();
    selectedLoan.value =
      rawBorrows.value.find((item) => item.id === loan.id) ||
      rawBorrows.value[0] ||
      null;
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isMutating.value = false;
  }
}

async function runPrimaryAction(loan) {
  const status = loan?.status;
  if (status === "PENDING") {
    await updateBorrowStatus(loan, "approve");
    return;
  }

  if (status === "APPROVED") {
    await updateBorrowStatus(loan, "hand-over");
    return;
  }

  if (["BORROWING", "OVERDUE"].includes(status)) {
    await updateBorrowStatus(loan, "return");
    return;
  }

  if (["RETURNED", "LOST"].includes(status) && loan?.fineStatus === "UNPAID") {
    await updateBorrowStatus(loan, "pay-fine");
  }
}

async function rejectSelected() {
  if (!selectedLoan.value || selectedLoan.value.status !== "PENDING") return;
  await updateBorrowStatus(selectedLoan.value, "reject", {
    reason: "Từ chối từ giao diện quản trị",
  });
}

async function approveExtensionSelected() {
  if (!canApproveExtension.value || !selectedLoan.value) return;
  await updateBorrowStatus(selectedLoan.value, "approve-extension");
}

async function rejectExtensionSelected() {
  if (!canRejectExtension.value || !selectedLoan.value) return;
  await updateBorrowStatus(selectedLoan.value, "reject-extension", {
    reason: "Yêu cầu gia hạn không được chấp nhận",
  });
}

async function markSelectedAsLost() {
  if (!canMarkLost.value || !selectedLoan.value) return;

  const accepted = window.confirm(
    "Xác nhận báo mất sách? Hệ thống sẽ ghi nhận bồi thường bằng đúng đơn giá sách.",
  );
  if (!accepted) return;

  await updateBorrowStatus(selectedLoan.value, "lost");
}

onMounted(async () => {
  await fetchBorrows();
});

watch(selectedStatus, fetchBorrows);

function statusChipClass(status) {
  if (status === "EXTENSION_PENDING") {
    return "bg-[var(--primary-container)] text-[var(--on-primary-container)]";
  }
  if (status === "OVERDUE") return "status-chip-overdue";
  if (status === "RETURNED") return "status-chip-returned";
  if (status === "LOST") {
    return "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]";
  }
  if (status === "PENDING") return "status-chip-draft";
  if (status === "REJECTED" || status === "CANCELLED") {
    return "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]";
  }
  return "status-chip-active";
}
</script>
