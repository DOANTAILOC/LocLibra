<template>
  <main class="container mx-auto px-4 pt-10 pb-0 md:pt-12 md:pb-0">
    <section class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p
          class="text-xs font-bold tracking-[0.12em] text-[var(--on-surface-variant)] uppercase"
        >
          Khu vực độc giả
        </p>
        <h1
          class="mt-1 text-3xl font-bold text-[var(--on-surface)] md:text-4xl"
        >
          Mượn của tôi
        </h1>
        <p class="mt-2 max-w-2xl text-sm text-[var(--on-surface-variant)]">
          Theo dõi toàn bộ lịch sử yêu cầu mượn, trạng thái xử lý và thông tin
          trả sách của bạn.
        </p>
      </div>

      <button
        type="button"
        class="btn-primary px-5 py-2.5 text-xs"
        :disabled="loading"
        @click="fetchMyBorrows"
      >
        {{ loading ? "Đang tải..." : "Làm mới lịch sử" }}
      </button>
    </section>

    <section class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      <article
        v-for="item in statCards"
        :key="item.key"
        class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3"
      >
        <p
          class="text-[10px] font-bold tracking-[0.08em] text-[var(--on-surface-variant)] uppercase"
        >
          {{ item.label }}
        </p>
        <p class="mt-1 text-xl font-bold text-[var(--on-surface)]">
          {{ item.value }}
        </p>
      </article>
    </section>

    <section class="panel-surface mb-6 p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="relative flex-1">
          <span
            class="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] leading-none text-[var(--on-surface-variant)]"
            >search</span
          >
          <input
            v-model.trim="searchText"
            type="text"
            class="form-input !pl-11 !pr-12"
            placeholder="Tìm mã phiếu, tên sách, mã sách hoặc tác giả..."
          />
          <button
            v-if="searchText"
            type="button"
            class="absolute inset-y-0 right-2 inline-flex items-center rounded-md px-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
            @click="searchText = ''"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <select
          v-model="selectedStatus"
          class="form-select !w-full md:!w-64 md:flex-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option
            v-for="status in availableStatuses"
            :key="status"
            :value="status"
          >
            {{ statusLabel(status) }}
          </option>
        </select>
      </div>
    </section>

    <section
      v-if="errorMessage"
      class="mb-6 rounded-xl border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] p-4 text-sm text-[var(--on-error-container)]"
    >
      {{ errorMessage }}
    </section>

    <section
      v-if="successMessage"
      class="mb-6 rounded-xl border border-[rgb(83_99_79/35%)] bg-[rgb(83_99_79/10%)] p-4 text-sm text-[var(--on-primary-container)]"
    >
      {{ successMessage }}
    </section>

    <section
      v-if="loading"
      class="panel-surface p-6 text-sm text-[var(--on-surface-variant)]"
    >
      Đang tải dữ liệu mượn sách...
    </section>

    <section
      v-else-if="!filteredBorrows.length"
      class="panel-surface p-6 text-sm text-[var(--on-surface-variant)]"
    >
      Không tìm thấy phiếu mượn phù hợp với bộ lọc hiện tại.
    </section>

    <section v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
      <div class="space-y-3">
        <article
          v-for="borrow in paginatedBorrows"
          :key="borrow.id"
          class="cursor-pointer rounded-xl border p-4 transition"
          :class="
            selectedBorrow?.id === borrow.id
              ? 'border-[var(--primary)] bg-[var(--surface-container-low)] shadow-md'
              : 'border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:border-[var(--primary)]'
          "
          @click="selectedBorrowId = borrow.id"
        >
          <div class="flex gap-4">
            <img
              :src="coverByBorrow(borrow)"
              :alt="borrow.bookTitle"
              class="h-24 w-16 rounded-md border border-[var(--outline-variant)] object-cover"
            />

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p
                    class="truncate text-base font-bold text-[var(--on-surface)]"
                  >
                    {{ borrow.bookTitle }}
                  </p>
                  <p
                    class="mt-0.5 text-[11px] text-[var(--on-surface-variant)]"
                  >
                    {{ borrow.bookCode }} • {{ borrow.borrowCode }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-1.5">
                  <span :class="statusClass(borrow.status)">
                    {{ statusLabel(borrow.status) }}
                  </span>
                  <span
                    v-if="borrow.isOverdueFinePaid"
                    class="status-chip bg-[rgb(83_99_79/18%)] text-[var(--on-primary-container)]"
                  >
                    PAID
                  </span>
                  <span
                    v-if="borrow.isOverdueFineUnpaid"
                    class="status-chip bg-[rgb(254_139_112/22%)] text-[var(--on-error-container)]"
                  >
                    UNPAID
                  </span>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
                <div>
                  <p class="text-[var(--on-surface-variant)]">Yêu cầu</p>
                  <p class="font-semibold text-[var(--on-surface)]">
                    {{ formatDateTime(borrow.requestDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-[var(--on-surface-variant)]">Mượn</p>
                  <p class="font-semibold text-[var(--on-surface)]">
                    {{ formatDateTime(borrow.borrowDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-[var(--on-surface-variant)]">Hạn trả</p>
                  <p
                    class="font-semibold"
                    :class="
                      borrow.status === 'OVERDUE'
                        ? 'text-[var(--error)]'
                        : 'text-[var(--on-surface)]'
                    "
                  >
                    {{ formatDateTime(borrow.dueDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-[var(--on-surface-variant)]">Tiền phạt</p>
                  <p class="font-semibold text-[var(--on-surface)]">
                    {{ formatCurrency(borrow.fineAmount) }}
                  </p>
                </div>
                <div>
                  <p class="text-[var(--on-surface-variant)]">Nhân viên</p>
                  <p class="font-semibold text-[var(--on-surface)]">
                    {{ borrow.staffName }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <PaginationBar
          v-if="totalPages > 1"
          class="mt-2"
          :range-label="pageRangeLabel"
          :current-page="currentPage"
          :total-pages="totalPages"
          :boxed="true"
          :scroll-to-top-on-change="true"
          :scroll-top-offset="0"
          @update:current-page="goToPage"
        />
      </div>

      <aside
        class="panel-surface h-fit p-5 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
      >
        <template v-if="selectedBorrow">
          <p
            class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
          >
            Chi tiết phiếu mượn
          </p>
          <h2 class="mt-1 text-xl font-bold text-[var(--on-surface)]">
            {{ selectedBorrow.bookTitle }}
          </h2>
          <p class="mt-1 text-xs text-[var(--on-surface-variant)]">
            {{ selectedBorrow.bookCode }} • {{ selectedBorrow.borrowCode }}
          </p>

          <div class="mt-4 flex items-center justify-between">
            <div class="flex flex-wrap items-center gap-1.5">
              <span :class="statusClass(selectedBorrow.status)">
                {{ statusLabel(selectedBorrow.status) }}
              </span>
              <span
                v-if="selectedBorrow.isOverdueFinePaid"
                class="status-chip bg-[rgb(83_99_79/18%)] text-[var(--on-primary-container)]"
              >
                PAID
              </span>
              <span
                v-if="selectedBorrow.isOverdueFineUnpaid"
                class="status-chip bg-[rgb(254_139_112/22%)] text-[var(--on-error-container)]"
              >
                UNPAID
              </span>
            </div>
            <p class="text-xs text-[var(--on-surface-variant)]">
              Cập nhật: {{ formatDateTime(selectedBorrow.updatedAt) }}
            </p>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div
              v-for="item in timelineItems(selectedBorrow)"
              :key="item.label"
              class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3"
            >
              <p
                class="text-[10px] font-bold tracking-[0.08em] text-[var(--on-surface-variant)] uppercase"
              >
                {{ item.label }}
              </p>
              <p class="mt-1 font-semibold text-[var(--on-surface)]">
                {{ item.value }}
              </p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-lg bg-[var(--surface-container-low)] p-3">
              <p class="text-[var(--on-surface-variant)]">Số ngày trễ</p>
              <p class="mt-1 text-lg font-bold text-[var(--on-surface)]">
                {{ selectedBorrow.overdueDays }} ngày
              </p>
            </div>
            <div class="rounded-lg bg-[var(--surface-container-low)] p-3">
              <p class="text-[var(--on-surface-variant)]">Trạng thái phạt</p>
              <p class="mt-1 text-lg font-bold text-[var(--on-surface)]">
                {{ fineStatusLabel(selectedBorrow.fineStatus) }}
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <button
              v-if="canCancelSelectedBorrow"
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/12%)] py-2.5 text-xs font-bold text-[var(--on-error-container)] transition hover:bg-[rgb(254_139_112/20%)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isCancelling"
              @click="cancelSelectedBorrowRegistration"
            >
              <span class="material-symbols-outlined text-sm">close</span>
              {{ cancelBorrowButtonLabel }}
            </button>

            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canRequestExtension || isExtending"
              @click="requestExtension"
            >
              <span class="material-symbols-outlined text-sm"
                >event_repeat</span
              >
              {{ extensionButtonLabel }}
            </button>
            <p
              v-if="selectedBorrow"
              class="text-xs text-[var(--on-surface-variant)]"
            >
              Đã gia hạn: {{ selectedBorrow.extensionCount }} / 1 lần.
            </p>
            <p
              v-if="selectedBorrow"
              class="text-xs"
              :class="
                selectedBorrow.extensionRequestStatus === 'PENDING'
                  ? 'text-[var(--primary)]'
                  : selectedBorrow.extensionRequestStatus === 'REJECTED'
                    ? 'text-[var(--error)]'
                    : 'text-[var(--on-surface-variant)]'
              "
            >
              Trạng thái yêu cầu gia hạn:
              {{
                extensionRequestStatusLabel(
                  selectedBorrow.extensionRequestStatus,
                )
              }}
            </p>
            <p
              v-if="
                selectedBorrow?.extensionRequestStatus === 'REJECTED' &&
                selectedBorrow?.extensionRejectReason
              "
              class="text-xs text-[var(--error)]"
            >
              Lý do từ chối gia hạn: {{ selectedBorrow.extensionRejectReason }}
            </p>
          </div>

          <div
            v-if="canVoteSelectedBorrow"
            class="mt-5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3"
          >
            <p
              class="text-[10px] font-bold tracking-[0.08em] text-[var(--on-surface-variant)] uppercase"
            >
              Đánh giá sách đã trả
            </p>

            <div class="mt-2 flex items-center gap-2">
              <button
                v-for="star in 5"
                :key="`borrow-vote-${star}`"
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full transition"
                :class="
                  star <= selectedScore
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-[var(--surface-container-lowest)] text-[var(--outline)] hover:bg-amber-50'
                "
                :disabled="voting"
                @click="selectedScore = star"
              >
                <span
                  class="material-symbols-outlined text-[18px]"
                  :class="{ 'material-symbols-filled': star <= selectedScore }"
                >
                  {{ star <= selectedScore ? "star" : "star_outline" }}
                </span>
              </button>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="btn-primary px-4 py-2 text-[11px]"
                :disabled="voting || selectedScore < 1"
                @click="submitVoteForSelectedBorrow"
              >
                {{ myVoteScore ? "Cập nhật đánh giá" : "Gửi đánh giá" }}
              </button>

              <button
                v-if="myVoteScore"
                type="button"
                class="btn-secondary px-4 py-2 text-[11px]"
                :disabled="voting"
                @click="removeVoteForSelectedBorrow"
              >
                Hủy vote
              </button>
            </div>

            <p
              v-if="voteMessage"
              class="mt-2 text-xs text-[var(--on-surface-variant)]"
            >
              {{ voteMessage }}
            </p>
          </div>

          <div
            v-if="selectedBorrow.rejectReason"
            class="mt-5 rounded-lg border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/15%)] p-3 text-sm text-[var(--on-error-container)]"
          >
            <p class="font-bold">Lý do từ chối/hủy</p>
            <p class="mt-1">{{ selectedBorrow.rejectReason }}</p>
          </div>
        </template>
      </aside>
    </section>

    <AppFooter class="mt-6" />

    <div
      v-if="extensionSuccessModalOpen"
      class="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 px-4 py-6"
      @click.self="closeExtensionSuccessModal"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white shadow-2xl"
      >
        <div
          class="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-5 py-4"
        >
          <h3 class="text-lg font-bold text-[var(--on-surface)]">
            Thông báo gia hạn
          </h3>
        </div>

        <div class="px-5 py-5">
          <p
            class="rounded-lg border border-[rgb(126_197_112/45%)] bg-[rgb(126_197_112/12%)] px-3 py-3 text-sm leading-relaxed text-[rgb(41_88_31)]"
          >
            {{ extensionSuccessModalMessage }}
          </p>
        </div>

        <div
          class="flex justify-end border-t border-[var(--outline-variant)] px-5 py-4"
        >
          <button
            type="button"
            class="btn-primary px-4 py-2 text-xs sm:min-w-[110px]"
            @click="closeExtensionSuccessModal"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import api from "../api/axios";
import PaginationBar from "../components/shared/PaginationBar.vue";
import AppFooter from "../components/shared/AppFooter.vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const loading = ref(false);
const isExtending = ref(false);
const isCancelling = ref(false);
const voting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const voteMessage = ref("");
const searchText = ref("");
const selectedStatus = ref("ALL");
const borrows = ref([]);
const selectedBorrowId = ref("");
const selectedScore = ref(0);
const myVoteScore = ref(0);
const extensionSuccessModalOpen = ref(false);
const extensionSuccessModalMessage = ref("");
const pageSize = 10;
const currentPage = ref(1);

const fallbackStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "BORROWING",
  "OVERDUE",
  "RETURNED",
  "LOST",
  "CANCELLED",
];

const availableStatuses = computed(() => {
  const fromData = borrows.value
    .map((item) =>
      String(item.TRANGTHAI || "")
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean);
  return [...new Set([...fallbackStatuses, ...fromData])];
});

const normalizedBorrows = computed(() => {
  return borrows.value.map((item) => ({
    id: item._id || `${item.MASACH}-${item.NGAYYEUCAU || ""}`,
    borrowCode: String(item?.MAPHIEU || "").trim() || "PM-NA",
    bookCode: item?.SACH?.MASACH || item.MASACH || "Không rõ",
    bookTitle: item?.SACH?.TENSACH || "Sách không còn trong hệ thống",
    bookAuthors: Array.isArray(item?.SACH?.TACGIA) ? item.SACH.TACGIA : [],
    cover: item?.SACH?.ANHBIA_URL || "",
    status: String(item.TRANGTHAI || "PENDING").toUpperCase(),
    requestDate: item.NGAYYEUCAU || null,
    approveDate: item.NGAYDUYET || null,
    pickupDeadline: item.NGAYHENLAY || null,
    borrowDate: item.NGAYMUON || item.NGAYNHAN || null,
    dueDate: item.NGAYHENTRA || null,
    returnedDate: item.NGAYTRA || null,
    rejectReason: item.LYDOTUCHOI || "",
    staffCode: item?.NHANVIEN?.MSNV || item.MSNV || "---",
    staffName: item?.NHANVIEN?.HOTEN || "Chưa có nhân viên xử lý",
    overdueDays: Number(item.SONGAYTRE || 0),
    fineAmount: Number(item.TIENPHAT || 0),
    fineStatus: item.TRANGTHAI_PHAT || "PAID",
    isOverdueFinePaid:
      ["RETURNED", "LOST"].includes(
        String(item.TRANGTHAI || "").toUpperCase(),
      ) &&
      (String(item.TRANGTHAI || "").toUpperCase() !== "RETURNED" ||
        Number(item.SONGAYTRE || 0) > 0) &&
      Number(item.TIENPHAT || 0) > 0 &&
      String(item.TRANGTHAI_PHAT || "").toUpperCase() === "PAID",
    isOverdueFineUnpaid:
      ["RETURNED", "LOST"].includes(
        String(item.TRANGTHAI || "").toUpperCase(),
      ) &&
      (String(item.TRANGTHAI || "").toUpperCase() !== "RETURNED" ||
        Number(item.SONGAYTRE || 0) > 0) &&
      Number(item.TIENPHAT || 0) > 0 &&
      String(item.TRANGTHAI_PHAT || "").toUpperCase() === "UNPAID",
    extensionCount: Number(item.SO_LAN_GIA_HAN || 0),
    extensionRequestStatus: item.TRANGTHAI_GIA_HAN || "NONE",
    extensionRequestDate: item.NGAYYEUCAU_GIA_HAN || null,
    extensionApprovedDate: item.NGAYDUYET_GIA_HAN || null,
    extensionRejectReason: item.LYDO_TUCHOI_GIA_HAN || "",
    lastExtendedAt: item.NGAYGIAHAN_CUOI || null,
    updatedAt: item.updated_at || item.created_at || item.NGAYYEUCAU || null,
  }));
});

const canRequestExtension = computed(() => {
  if (!selectedBorrow.value) return false;
  if (selectedBorrow.value.status !== "BORROWING") return false;
  if ((selectedBorrow.value.extensionCount || 0) >= 1) return false;
  if (selectedBorrow.value.extensionRequestStatus === "PENDING") return false;
  if (!selectedBorrow.value.dueDate) return false;

  const dueDate = new Date(selectedBorrow.value.dueDate);
  if (Number.isNaN(dueDate.getTime())) return false;
  return dueDate.getTime() > Date.now();
});

const canCancelSelectedBorrow = computed(() => {
  if (!selectedBorrow.value) return false;
  return ["PENDING", "APPROVED"].includes(selectedBorrow.value.status);
});

const filteredBorrows = computed(() => {
  const keyword = normalizeSearchText(searchText.value);

  return normalizedBorrows.value.filter((item) => {
    const matchesStatus =
      selectedStatus.value === "ALL" || item.status === selectedStatus.value;

    const haystack = [
      item.borrowCode,
      item.bookCode,
      item.bookTitle,
      item.bookAuthors.join(" "),
      item.staffCode,
      item.staffName,
      statusLabel(item.status),
      extensionRequestStatusLabel(item.extensionRequestStatus),
    ]
      .join(" ")
      .trim();

    const matchesSearch =
      !keyword || normalizeSearchText(haystack).includes(keyword);

    return matchesStatus && matchesSearch;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBorrows.value.length / pageSize)),
);

const paginatedBorrows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredBorrows.value.slice(start, start + pageSize);
});

const pageRangeLabel = computed(() => {
  const total = filteredBorrows.value.length;
  if (!total) return "0 - 0 trên 0 phiếu mượn";
  const start = (currentPage.value - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  return `${start} - ${end} trên ${total} phiếu mượn`;
});

const selectedBorrow = computed(() => {
  if (!filteredBorrows.value.length) return null;

  return (
    filteredBorrows.value.find((item) => item.id === selectedBorrowId.value) ||
    filteredBorrows.value[0]
  );
});

const currentAccountId = computed(() => authStore.user?.account?.id || "");

const canVoteSelectedBorrow = computed(() => {
  return (
    !!selectedBorrow.value &&
    selectedBorrow.value.status === "RETURNED" &&
    !!selectedBorrow.value.bookCode &&
    selectedBorrow.value.bookCode !== "Không rõ"
  );
});

const statCards = computed(() => {
  const byStatus = normalizedBorrows.value.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return [
    { key: "ALL", label: "Tổng phiếu", value: normalizedBorrows.value.length },
    { key: "PENDING", label: "Chờ duyệt", value: byStatus.PENDING || 0 },
    { key: "APPROVED", label: "Đã duyệt", value: byStatus.APPROVED || 0 },
    { key: "BORROWING", label: "Đang mượn", value: byStatus.BORROWING || 0 },
    { key: "OVERDUE", label: "Quá hạn", value: byStatus.OVERDUE || 0 },
    { key: "RETURNED", label: "Đã trả", value: byStatus.RETURNED || 0 },
    { key: "LOST", label: "Mất sách", value: byStatus.LOST || 0 },
    { key: "REJECTED", label: "Từ chối", value: byStatus.REJECTED || 0 },
  ];
});

watch(filteredBorrows, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / pageSize));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }

  if (!list.length) {
    selectedBorrowId.value = "";
    return;
  }

  const exists = list.some((item) => item.id === selectedBorrowId.value);
  if (!exists) {
    selectedBorrowId.value = list[0].id;
  }
});

watch([searchText, selectedStatus], () => {
  currentPage.value = 1;
});

watch(selectedBorrow, () => {
  fetchVoteForSelectedBorrow();
});

function goToPage(page) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber)) return;
  if (pageNumber < 1 || pageNumber > totalPages.value) return;
  currentPage.value = pageNumber;
}

const extensionButtonLabel = computed(() => {
  if (isExtending.value) return "Đang gửi yêu cầu...";

  const status = selectedBorrow.value?.extensionRequestStatus;
  if (status === "PENDING") return "Đã gửi yêu cầu gia hạn";
  if (status === "APPROVED") return "Đã được duyệt gia hạn";

  if (status === "REJECTED") {
    return canRequestExtension.value
      ? "Gửi lại yêu cầu gia hạn 1 tuần"
      : "Không thể gia hạn thêm";
  }

  return "Gửi yêu cầu gia hạn 1 tuần";
});

const cancelBorrowButtonLabel = computed(() => {
  if (isCancelling.value) return "Đang hủy đăng ký...";
  if (selectedBorrow.value?.status === "APPROVED") {
    return "Hủy đăng ký nhận sách";
  }
  return "Hủy yêu cầu mượn";
});

function parseBorrowResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function statusLabel(status) {
  const map = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    BORROWING: "Đang mượn",
    OVERDUE: "Quá hạn",
    RETURNED: "Đã trả",
    LOST: "Mất sách",
    CANCELLED: "Đã hủy",
  };

  return map[status] || status;
}

function statusClass(status) {
  const base = "status-chip";
  if (["BORROWING", "APPROVED"].includes(status)) {
    return `${base} status-chip-active`;
  }
  if (status === "OVERDUE") {
    return `${base} status-chip-overdue`;
  }
  if (status === "LOST") {
    return `${base} bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]`;
  }
  if (status === "RETURNED") {
    return `${base} status-chip-returned`;
  }

  return `${base} status-chip-draft`;
}

function fineStatusLabel(status) {
  return status === "UNPAID" ? "Chưa thanh toán" : "Đã thanh toán";
}

function extensionRequestStatusLabel(status) {
  const map = {
    NONE: "Chưa gửi",
    PENDING: "Đang chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Bị từ chối",
  };
  return map[status] || status;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function coverByBorrow(item) {
  if (item.cover) return item.cover;
  const seed = encodeURIComponent(item.bookCode || item.bookTitle || "book");
  return `https://picsum.photos/seed/${seed}/500/800`;
}

function timelineItems(item) {
  return [
    { label: "Ngày yêu cầu", value: formatDateTime(item.requestDate) },
    { label: "Ngày duyệt", value: formatDateTime(item.approveDate) },
    {
      label: "Nhân viên xử lý",
      value: `${item.staffName} (${item.staffCode})`,
    },
    { label: "Hạn nhận sách", value: formatDateTime(item.pickupDeadline) },
    { label: "Ngày nhận sách", value: formatDateTime(item.borrowDate) },
    { label: "Hạn trả", value: formatDateTime(item.dueDate) },
    {
      label: "Yêu cầu gia hạn",
      value: `${extensionRequestStatusLabel(item.extensionRequestStatus)} (${formatDateTime(item.extensionRequestDate)})`,
    },
    {
      label: "Duyệt gia hạn",
      value: formatDateTime(item.extensionApprovedDate),
    },
    { label: "Ngày trả", value: formatDateTime(item.returnedDate) },
    { label: "Tiền phạt", value: formatCurrency(item.fineAmount) },
  ];
}

function closeExtensionSuccessModal() {
  extensionSuccessModalOpen.value = false;
}

async function requestExtension() {
  if (!selectedBorrow.value || !canRequestExtension.value) return;

  isExtending.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { data } = await api.patch(
      `/borrows/${selectedBorrow.value.id}/extend`,
    );
    successMessage.value = data?.message || "Đã gửi yêu cầu gia hạn";
    extensionSuccessModalMessage.value =
      data?.message || "Đã gửi yêu cầu gia hạn thành công.";
    extensionSuccessModalOpen.value = true;
    await fetchMyBorrows();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể xin gia hạn phiếu mượn lúc này.";
  } finally {
    isExtending.value = false;
  }
}

async function cancelSelectedBorrowRegistration() {
  if (!selectedBorrow.value || !canCancelSelectedBorrow.value) return;

  const isConfirmed = window.confirm(
    "Bạn có chắc chắn muốn hủy đăng ký mượn cho phiếu này?",
  );
  if (!isConfirmed) return;

  isCancelling.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { data } = await api.patch(
      `/borrows/${selectedBorrow.value.id}/cancel`,
    );
    successMessage.value = data?.message || "Đã hủy đăng ký mượn";
    await fetchMyBorrows();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể hủy đăng ký mượn vào lúc này.";
  } finally {
    isCancelling.value = false;
  }
}

async function fetchVoteForSelectedBorrow() {
  voteMessage.value = "";
  selectedScore.value = 0;
  myVoteScore.value = 0;

  if (!canVoteSelectedBorrow.value) return;

  try {
    const { data } = await api.get(
      `/votes/books/${selectedBorrow.value.bookCode}`,
    );
    const voters = Array.isArray(data?.voters) ? data.voters : [];
    const mine = voters.find(
      (item) =>
        String(item?.accountId || "") === String(currentAccountId.value),
    );

    myVoteScore.value = Number(mine?.score || 0);
    selectedScore.value = myVoteScore.value;
  } catch {
    myVoteScore.value = 0;
    selectedScore.value = 0;
  }
}

async function submitVoteForSelectedBorrow() {
  if (!canVoteSelectedBorrow.value || selectedScore.value < 1) return;

  voting.value = true;
  voteMessage.value = "";

  try {
    await api.post(`/votes/books/${selectedBorrow.value.bookCode}`, {
      score: selectedScore.value,
    });
    myVoteScore.value = selectedScore.value;
    voteMessage.value = "Đã lưu đánh giá của bạn.";
  } catch (error) {
    voteMessage.value =
      error?.response?.data?.message || "Không thể gửi đánh giá lúc này.";
  } finally {
    voting.value = false;
  }
}

async function removeVoteForSelectedBorrow() {
  if (!canVoteSelectedBorrow.value || !myVoteScore.value) return;

  voting.value = true;
  voteMessage.value = "";

  try {
    await api.delete(`/votes/books/${selectedBorrow.value.bookCode}`);
    myVoteScore.value = 0;
    selectedScore.value = 0;
    voteMessage.value = "Đã hủy đánh giá.";
  } catch (error) {
    voteMessage.value =
      error?.response?.data?.message || "Không thể hủy đánh giá lúc này.";
  } finally {
    voting.value = false;
  }
}

async function fetchMyBorrows() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await api.get("/borrows/my");
    borrows.value = parseBorrowResponse(data);
  } catch (error) {
    borrows.value = [];
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể tải lịch sử mượn. Vui lòng thử lại sau.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchMyBorrows();
});
</script>
