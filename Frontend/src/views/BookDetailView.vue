<template>
  <main class="container mx-auto px-4 pt-10 pb-0 md:pt-12 md:pb-0">
    <nav
      class="mb-8 flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-[var(--on-surface-variant)] uppercase"
    >
      <RouterLink to="/" class="hover:text-[var(--primary)]"
        >Trang chủ</RouterLink
      >
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <RouterLink to="/books" class="hover:text-[var(--primary)]"
        >Kho sách</RouterLink
      >
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <span class="text-[var(--primary)]">{{
        book?.TENSACH || "Chi tiết sách"
      }}</span>
    </nav>

    <section
      v-if="loading"
      class="panel-surface p-6 text-sm text-[var(--on-surface-variant)]"
    >
      Đang tải thông tin sách...
    </section>

    <section
      v-else-if="errorMessage"
      class="rounded-xl border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] p-4 text-sm text-[var(--on-error-container)]"
    >
      {{ errorMessage }}
    </section>

    <section v-else-if="book" class="space-y-16">
      <BookOverviewSection
        :book="book"
        :book-cover="bookCover"
        :borrowing="borrowing"
        :is-available="isAvailable"
        :borrow-action-label="borrowActionLabel"
        :borrow-status-label="borrowStatusLabel"
        :borrow-disabled="borrowDisabled"
        :vote-summary="voteSummary"
        @borrow="handleBorrow"
      />

      <section>
        <BookDetailSpecs :detail-items="detailItems" />
      </section>

      <section>
        <BookVotesSection :vote-summary="voteSummary" />
      </section>

      <section>
        <div class="mb-6 flex items-end justify-between">
          <h2 class="font-headline text-3xl">Sách cùng thể loại</h2>
          <RouterLink
            to="/books"
            class="text-sm font-semibold text-[var(--primary)] hover:underline"
            >Xem tất cả</RouterLink
          >
        </div>

        <div
          v-if="relatedBooks.length"
          class="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5"
        >
          <article
            v-for="item in relatedBooks"
            :key="item._id"
            class="group cursor-pointer"
            @click="router.push(`/books/${item._id}`)"
          >
            <div
              class="mb-3 aspect-[2/3] overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
            >
              <img
                :src="coverByBook(item)"
                :alt="item.TENSACH"
                class="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />
            </div>
            <h3
              class="line-clamp-1 text-sm font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)]"
            >
              {{ item.TENSACH }}
            </h3>
            <p
              class="text-[11px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)]"
            >
              {{ authorTextByBook(item) }}
            </p>
          </article>
        </div>
      </section>
    </section>

    <AppFooter class="mt-6" />

    <div
      v-if="isBorrowDialogOpen"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6"
      @click.self="closeBorrowDialog"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-white shadow-2xl"
      >
        <div
          class="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-5 py-4"
        >
          <h3 class="text-lg font-bold text-[var(--on-surface)]">
            Xác nhận đăng ký mượn
          </h3>
        </div>

        <div class="space-y-4 px-5 py-5">
          <div
            v-if="borrowDialogType === 'confirm'"
            class="space-y-3 text-sm text-[var(--on-surface-variant)]"
          >
            <p>
              Bạn sắp đăng ký mượn
              <strong class="text-[var(--on-surface)]"
                >"{{ borrowDialogBookTitle }}"</strong
              >
            </p>
            <div
              class="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2.5 leading-relaxed"
            >
              <p>Thời hạn mượn: 14 ngày</p>
              <p>Quá hạn có thể phát sinh phí</p>
            </div>
            <p class="font-medium text-[var(--on-surface)]">
              Bạn có muốn tiếp tục?
            </p>
          </div>

          <p
            v-else
            class="rounded-lg border px-3 py-3 text-sm leading-relaxed"
            :class="
              borrowDialogType === 'success'
                ? 'border-[rgb(126_197_112/45%)] bg-[rgb(126_197_112/12%)] text-[rgb(41_88_31)]'
                : 'border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/12%)] text-[var(--on-error-container)]'
            "
          >
            {{ borrowDialogMessage }}
          </p>
        </div>

        <div
          class="flex flex-col-reverse gap-2 border-t border-[var(--outline-variant)] px-5 py-4 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            class="btn-secondary px-4 py-2 text-xs sm:min-w-[110px]"
            :disabled="borrowDialogSubmitting"
            @click="closeBorrowDialog"
          >
            {{ borrowDialogType === "confirm" ? "Hủy" : "Đóng" }}
          </button>

          <button
            v-if="borrowDialogType === 'confirm'"
            type="button"
            class="btn-primary px-4 py-2 text-xs sm:min-w-[140px]"
            :disabled="borrowDialogSubmitting"
            @click="confirmBorrowFromDialog"
          >
            {{ borrowDialogSubmitting ? "Đang gửi..." : "Xác nhận mượn" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import BookOverviewSection from "../components/book-detail/BookOverviewSection.vue";
import BookDetailSpecs from "../components/book-detail/BookDetailSpecs.vue";
import BookVotesSection from "../components/book-detail/BookVotesSection.vue";
import AppFooter from "../components/shared/AppFooter.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const borrowing = ref(false);
const errorMessage = ref("");
const book = ref(null);
const relatedBooks = ref([]);
const myBorrowStatus = ref("");
const borrowDialogOpen = ref(false);
const borrowDialogType = ref("confirm");
const borrowDialogMessage = ref("");
const borrowDialogSubmitting = ref(false);

const voteSummary = reactive({
  averageScore: "0.0",
  totalVotes: 0,
  voters: [],
});

const isAvailable = computed(() => Number(book.value?.SOQUYEN || 0) > 0);
const normalizedBorrowStatus = computed(() =>
  String(myBorrowStatus.value || "")
    .trim()
    .toUpperCase(),
);
const borrowStatusLabel = computed(() => {
  const map = {
    PENDING: "Đang đăng ký",
    APPROVED: "Đã duyệt - chờ nhận",
    BORROWING: "Đang mượn",
    OVERDUE: "Đang quá hạn",
  };

  return map[normalizedBorrowStatus.value] || "";
});
const borrowDisabled = computed(() => {
  if (borrowing.value) return true;
  if (!authStore.isReader) return true;
  if (!isAvailable.value) return true;
  return ["PENDING", "APPROVED", "BORROWING", "OVERDUE"].includes(
    normalizedBorrowStatus.value,
  );
});
const borrowActionLabel = computed(() => {
  if (borrowing.value) return "Đang gửi yêu cầu...";
  if (!authStore.isLoggedIn) return "Đăng nhập để mượn";
  if (!authStore.isReader) return "Chỉ độc giả được mượn";
  if (normalizedBorrowStatus.value === "PENDING") return "Đang đăng ký";
  if (normalizedBorrowStatus.value === "APPROVED") return "Đã duyệt - chờ nhận";
  if (normalizedBorrowStatus.value === "BORROWING") return "Đang mượn";
  if (normalizedBorrowStatus.value === "OVERDUE") return "Đang quá hạn";
  if (!isAvailable.value) return "Hết sách";
  return "Mượn sách";
});
const detailItems = computed(() => {
  if (!book.value) return [];

  const genres = toArrayField(book.value.THELOAI_TEN || book.value.THELOAI);

  return [
    { label: "Mã sách", value: book.value.MASACH || "Chưa rõ" },
    {
      label: "Thể loại",
      value: genres.length ? genres.join(", ") : "Chưa phân loại",
    },
    {
      label: "Nhà xuất bản",
      value: book.value.MANXB_TEN || book.value.MANXB || "Chưa rõ",
    },
    { label: "Năm xuất bản", value: book.value.NAMXUATBAN || "Chưa rõ" },
    { label: "Đơn giá", value: formatCurrency(book.value.DONGIA) },
    { label: "Số lượng", value: `${book.value.SOQUYEN || 0} cuốn` },
    { label: "Ngày tạo", value: formatDate(book.value.created_at) },
    { label: "Ngày cập nhật", value: formatDate(book.value.updated_at) },
  ];
});
const bookCover = computed(() => {
  if (!book.value) return "";
  return coverByBook(book.value);
});
const isBorrowDialogOpen = computed(() => borrowDialogOpen.value);
const borrowDialogBookTitle = computed(() =>
  String(book.value?.TENSACH || "quyển sách này").trim(),
);

function coverByBook(item) {
  if (item?.ANHBIA_URL) {
    return item.ANHBIA_URL;
  }

  const seed = encodeURIComponent(item.MASACH || item.TENSACH || "book");
  return `https://picsum.photos/seed/${seed}/900/1300`;
}

function toArrayField(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function authorTextByBook(item) {
  const authors = toArrayField(item?.TACGIA_TEN || item?.TACGIA);
  return authors.length ? authors.join(", ") : "Chưa rõ";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";
  return date.toLocaleDateString("vi-VN");
}

function applyVoteSummary(data) {
  if (!data) {
    voteSummary.averageScore = "0.0";
    voteSummary.totalVotes = 0;
    voteSummary.voters = [];
    return;
  }

  voteSummary.averageScore = data.averageScore || "0.0";
  voteSummary.totalVotes = data.totalVotes || 0;
  voteSummary.voters = data.voters || [];
}

function parseBorrowResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function fetchMyBorrowStatusForCurrentBook() {
  if (!authStore.isLoggedIn || !authStore.isReader || !book.value?.MASACH) {
    myBorrowStatus.value = "";
    return;
  }

  try {
    const { data } = await api.get("/borrows/my");
    const items = parseBorrowResponse(data);
    const active = items.find((item) => {
      const status = String(item?.TRANGTHAI || "").toUpperCase();
      const masach = item?.SACH?.MASACH || item?.MASACH;
      return (
        masach === book.value.MASACH &&
        ["PENDING", "APPROVED", "BORROWING", "OVERDUE"].includes(status)
      );
    });

    myBorrowStatus.value = active?.TRANGTHAI || "";
  } catch {
    myBorrowStatus.value = "";
  }
}

async function handleBorrow() {
  if (!authStore.isLoggedIn) {
    router.push("/login");
    return;
  }

  if (!book.value || !isAvailable.value || borrowDisabled.value) return;

  borrowDialogOpen.value = true;
  borrowDialogType.value = "confirm";
  borrowDialogMessage.value = "";
  borrowDialogSubmitting.value = false;
}

function closeBorrowDialog() {
  if (borrowDialogSubmitting.value) return;

  borrowDialogOpen.value = false;
  borrowDialogType.value = "confirm";
  borrowDialogMessage.value = "";
}

async function confirmBorrowFromDialog() {
  if (!book.value?.MASACH) return;

  if (!authStore.isReader) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value =
      "Chỉ tài khoản độc giả mới có thể đăng ký mượn sách.";
    return;
  }

  if (!isAvailable.value || borrowDisabled.value) return;

  borrowing.value = true;
  borrowDialogSubmitting.value = true;

  try {
    await api.post("/borrows/request", { MASACH: book.value.MASACH });
    borrowDialogType.value = "success";
    borrowDialogMessage.value =
      "Đã đăng kí mượn thành công, vui lòng theo dõi trang Mượn của tôi để xem cập nhật trạng thái.";
    await fetchMyBorrowStatusForCurrentBook();
  } catch (error) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value =
      error?.response?.data?.message || "Không thể gửi yêu cầu mượn lúc này.";
  } finally {
    borrowing.value = false;
    borrowDialogSubmitting.value = false;
  }
}

async function fetchBookDetail() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await api.get(`/books/${route.params.id}`);
    book.value = data;

    const [voteRes, relatedRes] = await Promise.all([
      api.get(`/votes/books/${data.MASACH}`).catch(() => ({ data: null })),
      api
        .get("/books", {
          params: {
            theloai: toArrayField(data.THELOAI)[0] || undefined,
          },
        })
        .catch(() => ({ data: [] })),
    ]);

    applyVoteSummary(voteRes.data);

    relatedBooks.value = (Array.isArray(relatedRes.data) ? relatedRes.data : [])
      .filter((item) => item._id !== data._id)
      .slice(0, 5);

    await fetchMyBorrowStatusForCurrentBook();
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Không thể tải trang chi tiết sách.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBookDetail);
</script>
