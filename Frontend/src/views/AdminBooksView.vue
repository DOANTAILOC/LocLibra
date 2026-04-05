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
        placeholder="Tìm kiếm trong kho sách..."
        @open-menu="mobileMenuOpen = true"
      />

      <div class="flex flex-1 overflow-hidden">
        <section class="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <AdminPageHero
            title="Quản lý Kho Sách"
            description="Theo dõi số lượng, tình trạng và phân loại đầu sách trong hệ thống."
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
                @click="fetchBooks"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >refresh</span
                >
                Làm mới
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)]"
                @click="openCreateModal"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
                Tạo sách mới
              </button>
            </template>
          </AdminPageHero>

          <AdminFilterBar>
            <div class="relative min-w-[240px] flex-1">
              <span
                class="material-symbols-outlined absolute inset-y-0 left-3 flex items-center text-sm text-[var(--on-surface-variant)]"
              >
                search
              </span>
              <input
                v-model.trim="searchText"
                type="text"
                class="w-full rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-9 pr-4 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Tên sách, tác giả hoặc mã sách..."
              />
            </div>

            <div class="flex gap-2">
              <select
                v-model="categoryFilter"
                class="cursor-pointer appearance-none rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-3 pr-8 text-xs font-bold text-[var(--on-surface-variant)]"
              >
                <option value="ALL">THỂ LOẠI</option>
                <option
                  v-for="genre in genreOptions"
                  :key="genre"
                  :value="genre"
                >
                  {{ genre }}
                </option>
              </select>

              <select
                v-model="stockFilter"
                class="cursor-pointer appearance-none rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-3 pr-8 text-xs font-bold text-[var(--on-surface-variant)]"
              >
                <option value="ALL">TRẠNG THÁI KHO</option>
                <option value="IN_STOCK">Còn sách</option>
                <option value="LOW_STOCK">Sắp hết</option>
                <option value="OUT_STOCK">Hết sách</option>
                <option value="DELETED">Đã xóa</option>
              </select>

              <button
                type="button"
                class="rounded-lg bg-[var(--surface-container-highest)] p-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
                @click="fetchBooks"
              >
                <span class="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </AdminFilterBar>

          <FeedbackAlert :message="errorMessage" type="error" />
          <FeedbackAlert :message="successMessage" type="success" />

          <AdminTableShell
            :loading="isLoading"
            :empty="!isLoading && filteredBooks.length === 0"
            :colspan="7"
            loading-text="Đang tải dữ liệu kho sách..."
            empty-text="Không tìm thấy sách phù hợp với bộ lọc hiện tại."
            :total-text="`Tổng ${filteredBooks.length} đầu sách`"
            min-width-class="min-w-[900px]"
          >
            <template #head>
              <tr
                class="border-b border-[rgb(184_188_163/20%)] bg-[var(--surface-container-low)]"
              >
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Bìa sách
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Sách
                </th>
                <th
                  class="px-4 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Mã & Năm XB
                </th>
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Số lượng
                </th>
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Giá
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
                v-for="book in filteredBooks"
                :key="book.id"
                class="group cursor-pointer border-l-4 transition-colors"
                :class="
                  selectedBook?.id === book.id
                    ? 'border-l-[var(--primary)] bg-[rgb(83_99_79/4%)]'
                    : 'border-l-transparent hover:bg-[rgb(83_99_79/2%)]'
                "
                @click="selectedBook = book"
              >
                <td class="px-4 py-4">
                  <div
                    class="mx-auto h-14 w-10 overflow-hidden rounded border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-high)]"
                  >
                    <img
                      v-if="book.coverUrl"
                      :src="book.coverUrl"
                      :alt="book.title"
                      class="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="text-sm font-bold">{{ book.title }}</p>
                    <p class="text-[11px] text-[var(--on-surface-variant)]">
                      {{ book.author }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <p class="text-xs font-semibold">{{ book.code }}</p>
                  <p class="text-[10px] text-[var(--on-surface-variant)]">
                    {{ book.publishedYear }}
                  </p>
                </td>
                <td class="px-4 py-4 text-center">
                  <span class="text-sm font-bold text-[var(--primary)]">{{
                    book.quantity
                  }}</span>
                  <p
                    class="text-[9px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
                  >
                    Quyển
                  </p>
                </td>
                <td class="px-4 py-4 text-center">
                  <p class="text-sm font-bold">{{ book.priceLabel }}</p>
                </td>
                <td class="px-4 py-4 text-center">
                  <StatusChip
                    :label="book.stockLabel"
                    :custom-class="book.stockClass"
                  />
                </td>
                <td class="px-6 py-4 text-right">
                  <div
                    class="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--primary)] transition hover:bg-[rgb(83_99_79/13%)]"
                      @click.stop="selectedBook = book"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >visibility</span
                      >
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
                      :disabled="isDeletingId === book.id || book.isDeleted"
                      @click.stop="handleDeleteBook(book)"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >delete</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </AdminTableShell>
        </section>

        <AdminDetailAside
          title="Chi tiết sách"
          :has-selection="!!selectedBook"
          empty-text="Chọn một đầu sách ở bảng để xem thông tin chi tiết."
        >
          <div class="space-y-5">
            <div class="text-center">
              <div
                class="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] ring-4 ring-[rgb(83_99_79/10%)]"
              >
                <img
                  v-if="selectedBook.coverUrl"
                  :src="selectedBook.coverUrl"
                  :alt="selectedBook.title"
                  class="h-full w-full rounded-2xl object-cover"
                />
                <span v-else class="material-symbols-outlined text-5xl"
                  >auto_stories</span
                >
              </div>
              <h5 class="text-xl">{{ selectedBook.title }}</h5>
              <p
                class="mt-1 text-[10px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase"
              >
                {{ selectedBook.category }}
              </p>
            </div>

            <div>
              <div
                class="mb-2 flex justify-between text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                <span>Mức tồn kho</span>
                <span class="text-[var(--primary)]"
                  >{{ selectedBook.quantity }} quyển</span
                >
              </div>
              <div
                class="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-container-highest)]"
              >
                <div
                  class="h-full rounded-full bg-[var(--primary)]"
                  :style="{ width: `${selectedBook.stockPercent}%` }"
                ></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div
                class="rounded-xl border border-[rgb(184_188_163/18%)] bg-[var(--surface-container-lowest)] p-3"
              >
                <p
                  class="mb-1 text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
                >
                  Mã sách
                </p>
                <p class="text-xs font-bold">{{ selectedBook.code }}</p>
              </div>
              <div
                class="rounded-xl border border-[rgb(184_188_163/18%)] bg-[var(--surface-container-lowest)] p-3"
              >
                <p
                  class="mb-1 text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
                >
                  Đơn giá
                </p>
                <p class="text-xs font-bold">{{ selectedBook.priceLabel }}</p>
              </div>
            </div>

            <div class="border-t border-[rgb(184_188_163/20%)] pt-4">
              <p
                class="mb-3 text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                Thông tin sách
              </p>
              <div class="space-y-2 text-sm">
                <p>
                  <span class="font-semibold">Tác giả:</span>
                  {{ selectedBook.author }}
                </p>
                <p>
                  <span class="font-semibold">Năm xuất bản:</span>
                  {{ selectedBook.publishedYear }}
                </p>
                <p>
                  <span class="font-semibold">Nhà xuất bản:</span>
                  {{ selectedBook.publisher }}
                </p>
                <p>
                  <span class="font-semibold">Ảnh bìa:</span>
                  {{ selectedBook.coverUrl || "Chưa có" }}
                </p>
                <p class="pt-1 text-[var(--on-surface-variant)]">
                  {{ selectedBook.description }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-3">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)]"
                :disabled="!selectedBook"
                @click="selectedBook && openEditModal(selectedBook)"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Chỉnh sửa sách
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(83_99_79/25%)] py-2.5 text-xs font-bold text-[var(--primary)]"
                :disabled="
                  !selectedBook ||
                  isDeletingId === selectedBook.id ||
                  selectedBook.isDeleted
                "
                @click="selectedBook && handleDeleteBook(selectedBook)"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
                Xóa sách
              </button>
            </div>
          </div>
        </AdminDetailAside>
      </div>
    </main>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
    >
      <div
        class="w-full max-w-2xl rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-2xl"
      >
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-2xl">
            {{ modalMode === "edit" ? "Chỉnh Sửa Sách" : "Tạo Sách Mới" }}
          </h3>
          <button
            type="button"
            class="rounded-lg p-1.5 transition hover:bg-[var(--surface-container-highest)]"
            @click="closeCreateModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
          @submit.prevent="handleSubmitBook"
        >
          <div v-if="modalMode === 'edit'" class="space-y-1">
            <label class="form-label">Mã sách</label>
            <input
              v-model.trim="newBook.MASACH"
              class="form-input"
              type="text"
              readonly
            />
          </div>
          <div v-else class="space-y-1">
            <label class="form-label">Mã sách</label>
            <input
              class="form-input"
              type="text"
              value="Tự động sinh theo dạng S + số thứ tự"
              readonly
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Tên sách</label>
            <input
              v-model.trim="newBook.TENSACH"
              required
              class="form-input"
              type="text"
              placeholder="Tên đầu sách"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Tác giả</label>
            <input
              v-model.trim="newBook.TACGIA"
              required
              class="form-input"
              type="text"
              placeholder="Tên tác giả"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Nhà xuất bản (MANXB)</label>
            <input
              v-model.trim="newBook.MANXB"
              required
              class="form-input"
              type="text"
              placeholder="VD: NXB001"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Đơn giá</label>
            <input
              v-model.number="newBook.DONGIA"
              required
              min="0"
              class="form-input"
              type="number"
              placeholder="0"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Số quyển</label>
            <input
              v-model.number="newBook.SOQUYEN"
              required
              min="0"
              class="form-input"
              type="number"
              placeholder="1"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Năm xuất bản</label>
            <input
              v-model.number="newBook.NAMXUATBAN"
              class="form-input"
              type="number"
              placeholder="2026"
            />
          </div>
          <div class="space-y-1">
            <label class="form-label">Thể loại</label>
            <input
              v-model.trim="newBook.THELOAI"
              class="form-input"
              type="text"
              placeholder="VD: Công nghệ"
            />
          </div>
          <div class="space-y-1 md:col-span-2">
            <label class="form-label">Mô tả ngắn</label>
            <textarea
              v-model.trim="newBook.MOTA_NGAN"
              class="form-input min-h-[90px]"
              placeholder="Nhập mô tả ngắn..."
            ></textarea>
          </div>

          <div class="space-y-1 md:col-span-2">
            <label class="form-label">Ảnh bìa sách</label>
            <input
              type="file"
              accept="image/*"
              class="form-input"
              @change="handleCoverFileChange"
            />
            <p class="text-xs text-[var(--on-surface-variant)]">
              Chấp nhận ảnh JPG/PNG/WebP, tối đa 5MB.
            </p>
            <div v-if="coverPreview || newBook.ANHBIA_URL" class="pt-2">
              <img
                :src="coverPreview || newBook.ANHBIA_URL"
                alt="Xem trước ảnh bìa"
                class="h-28 w-20 rounded-lg border border-[rgb(184_188_163/25%)] object-cover"
              />
            </div>
          </div>

          <div class="mt-2 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              class="btn-secondary px-4 py-2 text-sm"
              @click="closeCreateModal"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isCreating"
            >
              {{
                isCreating
                  ? modalMode === "edit"
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : modalMode === "edit"
                    ? "Cập nhật sách"
                    : "Tạo sách"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
const isCreating = ref(false);
const isDeletingId = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const searchText = ref("");
const categoryFilter = ref("ALL");
const stockFilter = ref("ALL");
const books = ref([]);
const selectedBook = ref(null);
const showCreateModal = ref(false);
const newBook = ref(getEmptyBookForm());
const modalMode = ref("create");
const coverFile = ref(null);
const coverPreview = ref("");

function getEmptyBookForm() {
  return {
    id: "",
    MASACH: "",
    TENSACH: "",
    TACGIA: "",
    MANXB: "",
    DONGIA: 0,
    SOQUYEN: 1,
    NAMXUATBAN: new Date().getFullYear(),
    THELOAI: "",
    MOTA_NGAN: "",
    ANHBIA_URL: "",
    ANHBIA_PUBLIC_ID: "",
  };
}

const genreOptions = computed(() => {
  return [
    ...new Set(books.value.map((item) => item.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
});

const filteredBooks = computed(() => {
  const keyword = searchText.value.toLowerCase();

  return books.value.filter((item) => {
    if (
      categoryFilter.value !== "ALL" &&
      item.category !== categoryFilter.value
    ) {
      return false;
    }

    if (stockFilter.value !== "ALL" && item.stockKey !== stockFilter.value) {
      return false;
    }

    if (!keyword) return true;

    return [item.title, item.author, item.code, item.category]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
});

watch(filteredBooks, (rows) => {
  if (!rows.length) {
    selectedBook.value = null;
    return;
  }

  if (!selectedBook.value) {
    selectedBook.value = rows[0];
    return;
  }

  const stillExists = rows.find((item) => item.id === selectedBook.value.id);
  if (!stillExists) {
    selectedBook.value = rows[0];
  }
});

function getStockMeta(quantity) {
  if (quantity <= 0) {
    return {
      stockKey: "OUT_STOCK",
      stockLabel: "Hết sách",
      stockClass: "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]",
      stockPercent: 0,
    };
  }

  if (quantity <= 3) {
    return {
      stockKey: "LOW_STOCK",
      stockLabel: "Sắp hết",
      stockClass:
        "bg-[var(--surface-container-highest)] text-[var(--on-primary-fixed-variant)]",
      stockPercent: Math.min(100, quantity * 15),
    };
  }

  return {
    stockKey: "IN_STOCK",
    stockLabel: "Còn sách",
    stockClass: "status-chip-active",
    stockPercent: Math.min(100, quantity * 8),
  };
}

function mapBook(item) {
  const isDeleted = item.TRANGTHAI === "DELETED";
  const stockMeta = isDeleted
    ? {
        stockKey: "DELETED",
        stockLabel: "Đã xóa",
        stockClass:
          "bg-[rgb(156_163_175/25%)] text-[rgb(75_85_99)] border border-[rgb(156_163_175/35%)]",
        stockPercent: 0,
      }
    : getStockMeta(item.SOQUYEN || 0);

  return {
    id: item._id,
    code: item.MASACH || "---",
    title: item.TENSACH || "Chưa có tên sách",
    author: item.TACGIA || "Chưa có tác giả",
    category: item.THELOAI || "Chưa phân loại",
    publishedYear: item.NAMXUATBAN || "---",
    quantity: item.SOQUYEN || 0,
    price: item.DONGIA || 0,
    priceLabel: `${(item.DONGIA || 0).toLocaleString("vi-VN")} VND`,
    publisher: item.MANXB || "---",
    description: item.MOTA_NGAN || "Chưa có mô tả ngắn cho đầu sách này.",
    coverUrl: item.ANHBIA_URL || "",
    coverPublicId: item.ANHBIA_PUBLIC_ID || "",
    isDeleted,
    ...stockMeta,
  };
}

function normalizeError(error) {
  const serverMessage = error?.response?.data?.message;
  const serverDetail = error?.response?.data?.error;

  return (
    (serverMessage && serverDetail
      ? `${serverMessage}: ${serverDetail}`
      : serverMessage) ||
    error?.message ||
    "Không thể tải dữ liệu kho sách"
  );
}

function getNextBookCodeFromClient() {
  const maxOrder = books.value.reduce((max, item) => {
    const matched = String(item.code || "").match(/^S(\d+)$/i);
    if (!matched) return max;

    const order = Number.parseInt(matched[1], 10);
    if (Number.isNaN(order)) return max;

    return Math.max(max, order);
  }, 0);

  return `S${String(maxOrder + 1).padStart(3, "0")}`;
}

async function fetchBooks() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const queryParams = new URLSearchParams({ includeDeleted: "true" });
    if (searchText.value) {
      queryParams.set("tensach", searchText.value);
    }
    const query = `?${queryParams.toString()}`;
    const response = await api.get(`/books${query}`);
    books.value = (response.data || []).map(mapBook);
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isLoading.value = false;
  }
}

function openCreateModal() {
  errorMessage.value = "";
  successMessage.value = "";
  modalMode.value = "create";
  newBook.value = getEmptyBookForm();
  coverFile.value = null;
  coverPreview.value = "";
  showCreateModal.value = true;
}

function openEditModal(book) {
  errorMessage.value = "";
  successMessage.value = "";
  modalMode.value = "edit";
  newBook.value = {
    id: book.id,
    MASACH: book.code,
    TENSACH: book.title,
    TACGIA: book.author,
    MANXB: book.publisher,
    DONGIA: book.price,
    SOQUYEN: book.quantity,
    NAMXUATBAN: book.publishedYear === "---" ? "" : book.publishedYear,
    THELOAI: book.category === "Chưa phân loại" ? "" : book.category,
    MOTA_NGAN:
      book.description === "Chưa có mô tả ngắn cho đầu sách này."
        ? ""
        : book.description,
    ANHBIA_URL: book.coverUrl || "",
    ANHBIA_PUBLIC_ID: book.coverPublicId || "",
  };
  coverFile.value = null;
  coverPreview.value = "";
  showCreateModal.value = true;
}

function closeCreateModal() {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value);
  }
  showCreateModal.value = false;
  newBook.value = getEmptyBookForm();
  coverFile.value = null;
  coverPreview.value = "";
}

function handleCoverFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    coverFile.value = null;
    coverPreview.value = "";
    return;
  }

  coverFile.value = file;
  coverPreview.value = URL.createObjectURL(file);
}

async function uploadCoverIfNeeded() {
  if (!coverFile.value) {
    return {
      url: newBook.value.ANHBIA_URL || "",
      publicId: newBook.value.ANHBIA_PUBLIC_ID || "",
    };
  }

  const formData = new FormData();
  formData.append("cover", coverFile.value);

  const response = await api.post("/books/upload-cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    url: response.data?.image?.url || "",
    publicId: response.data?.image?.publicId || "",
  };
}

async function handleSubmitBook() {
  isCreating.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const uploadedCover = await uploadCoverIfNeeded();

    const payload = {
      TENSACH: newBook.value.TENSACH,
      TACGIA: newBook.value.TACGIA,
      MANXB: newBook.value.MANXB,
      DONGIA: Number(newBook.value.DONGIA),
      SOQUYEN: Number(newBook.value.SOQUYEN),
      NAMXUATBAN: newBook.value.NAMXUATBAN
        ? Number(newBook.value.NAMXUATBAN)
        : undefined,
      THELOAI: newBook.value.THELOAI,
      MOTA_NGAN: newBook.value.MOTA_NGAN,
      ANHBIA_URL: uploadedCover.url,
      ANHBIA_PUBLIC_ID: uploadedCover.publicId,
      ...(modalMode.value === "edit"
        ? { MASACH: newBook.value.MASACH }
        : { MASACH: getNextBookCodeFromClient() }),
    };

    if (modalMode.value === "edit") {
      await api.put(`/books/${newBook.value.id}`, payload);
      successMessage.value = "Cập nhật sách thành công";
    } else {
      await api.post("/books", payload);
      successMessage.value = "Tạo sách mới thành công";
    }

    closeCreateModal();
    await fetchBooks();
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isCreating.value = false;
  }
}

async function handleDeleteBook(book) {
  if (!book?.id) return;

  const accepted = window.confirm(
    `Bạn chắc chắn muốn xóa sách ${book.title} (${book.code})?`,
  );
  if (!accepted) return;

  isDeletingId.value = book.id;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await api.delete(`/books/${book.id}`);
    successMessage.value = "Xóa sách thành công";
    await fetchBooks();
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isDeletingId.value = "";
  }
}

onMounted(fetchBooks);
</script>
