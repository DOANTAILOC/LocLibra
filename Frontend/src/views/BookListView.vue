<template>
  <main class="container mx-auto px-4 pt-10 pb-0 md:pt-12 md:pb-0">
    <section class="mb-8">
      <h1 class="text-3xl font-bold text-[var(--on-surface)] md:text-4xl">
        Kho Sách Thư Viện
      </h1>
      <p
        class="mt-2 max-w-2xl text-sm text-[var(--on-surface-variant)] md:text-base"
      >
        Tìm kiếm và lọc sách theo thể loại, nhà xuất bản, tác giả và trạng thái
        còn sách.
      </p>
    </section>

    <section class="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside class="space-y-5">
        <FilterSection
          v-for="filter in filterSections"
          :key="filter.key"
          :title="filter.title"
          :options="filter.options"
          :model-value="filter.selected"
          @update:model-value="updateFilter(filter.key, $event)"
        />

        <article class="panel-surface space-y-4 p-5">
          <h2
            class="text-sm font-bold tracking-[0.08em] text-[var(--on-surface)] uppercase"
          >
            Tác giả
          </h2>

          <div class="relative">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-[var(--on-surface-variant)]"
            >
              search
            </span>
            <input
              v-model="authorSearchText"
              type="text"
              class="form-input !pl-10"
              placeholder="Tìm tác giả..."
            />
          </div>

          <div class="space-y-2">
            <p
              class="text-[11px] font-semibold tracking-[0.08em] text-[var(--on-surface-variant)] uppercase"
            >
              Tác giả nổi bật
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="author in featuredAuthors"
                :key="author.value"
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                :class="
                  selectedAuthors.includes(author.value)
                    ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                    : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                "
                @click="toggleAuthor(author.value)"
              >
                {{ author.label }}
              </button>
            </div>
          </div>

          <div v-if="authorSearchText.trim().length" class="space-y-2">
            <p
              class="text-[11px] font-semibold tracking-[0.08em] text-[var(--on-surface-variant)] uppercase"
            >
              Kết quả tìm tác giả
            </p>

            <div class="space-y-1">
              <label
                v-for="author in searchedAuthors"
                :key="author.value"
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
              >
                <input
                  :checked="selectedAuthors.includes(author.value)"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--outline-variant)] text-[var(--primary)] focus:ring-[var(--primary-container)]"
                  @change="toggleAuthor(author.value)"
                />
                <span>{{ author.label }}</span>
              </label>
              <p
                v-if="!searchedAuthors.length"
                class="text-sm text-[var(--on-surface-variant)]"
              >
                Không tìm thấy tác giả phù hợp.
              </p>
            </div>
          </div>
        </article>

        <button
          type="button"
          class="btn-secondary w-full py-2.5 text-sm"
          @click="resetFilters"
        >
          Xóa bộ lọc
        </button>
      </aside>

      <section>
        <div
          class="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
        >
          <p class="text-sm text-[var(--on-surface-variant)]">
            Hiển thị
            <span class="font-semibold text-[var(--on-surface)]">{{
              filteredBooks.length
            }}</span>
            sách
          </p>

          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:flex-1"
          >
            <div class="relative w-full xl:max-w-[560px]">
              <span
                class="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] leading-none text-[var(--outline)]"
              >
                search
              </span>
              <input
                v-model.trim="searchText"
                type="text"
                class="h-12 w-full rounded-xl border border-[var(--outline-variant)] bg-white pl-12 pr-11 text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[rgb(214_232_207/45%)]"
                placeholder="Tìm theo tên sách hoặc tác giả..."
              />
              <button
                v-if="searchText"
                type="button"
                class="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--outline)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
                @click="searchText = ''"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <select
              v-model="sortBy"
              class="form-select h-12 w-full sm:w-auto sm:min-w-[170px] sm:max-w-[190px]"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div
          v-if="loading"
          class="panel-surface p-6 text-sm text-[var(--on-surface-variant)]"
        >
          Đang tải danh sách sách...
        </div>

        <div
          v-else-if="errorMessage"
          class="rounded-xl border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] p-4 text-sm text-[var(--on-error-container)]"
        >
          {{ errorMessage }}
        </div>

        <div
          v-else-if="!filteredBooks.length"
          class="panel-surface p-6 text-sm text-[var(--on-surface-variant)]"
        >
          Không có sách nào phù hợp với bộ lọc hiện tại.
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <BookCard
            v-for="book in paginatedBooks"
            :key="book._id || book.MASACH"
            :book="book"
            :borrow-status="borrowStatusForBook(book.MASACH)"
            :average-score="voteAverage(book.MASACH)"
            :total-votes="voteCount(book.MASACH)"
            @detail="goToBookDetail"
            @borrow="handleBorrowFromCard"
          />
        </div>

        <PaginationBar
          v-if="totalPages > 1"
          class="mt-6"
          :range-label="pageRangeLabel"
          :current-page="currentPage"
          :total-pages="totalPages"
          :boxed="true"
          :scroll-to-top-on-change="true"
          :scroll-top-offset="0"
          @update:current-page="goToPage"
        />
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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import FilterSection from "../components/books/FilterSection.vue";
import BookCard from "../components/books/BookCard.vue";
import PaginationBar from "../components/shared/PaginationBar.vue";
import AppFooter from "../components/shared/AppFooter.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const ACTIVE_BORROW_STATUSES = ["PENDING", "APPROVED", "BORROWING", "OVERDUE"];
const VALID_SORT_VALUES = [
  "newest",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
];

const loading = ref(false);
const errorMessage = ref("");
const books = ref([]);
const voteSummaryByMasach = ref({});
const myBorrowStatusByBook = ref({});
const borrowDialogBook = ref(null);
const borrowDialogType = ref("confirm");
const borrowDialogMessage = ref("");
const borrowDialogSubmitting = ref(false);

const searchText = ref(String(route.query?.q || "").trim());
const selectedGenres = ref(parseCodeQueryArray(route.query?.genres));
const selectedPublishers = ref(parseCodeQueryArray(route.query?.publishers));
const selectedAuthors = ref(parseCodeQueryArray(route.query?.authors));
const selectedStatuses = ref(parseQueryArray(route.query?.statuses));
const authorSearchText = ref("");
const sortBy = ref(parseSort(route.query?.sort));
const pageSize = 12;
const currentPage = ref(parsePage(route.query?.page));

const statusOptions = [
  { label: "Còn sách", value: "available" },
  { label: "Hết sách", value: "out" },
];

const sortOptions = [
  { label: "Mới cập nhật", value: "newest" },
  { label: "Tên A - Z", value: "name-asc" },
  { label: "Tên Z - A", value: "name-desc" },
  { label: "Giá tăng dần", value: "price-asc" },
  { label: "Giá giảm dần", value: "price-desc" },
];

const genreOptions = computed(() =>
  buildCodeOptions(books.value.flatMap((item) => getBookGenrePairs(item))),
);
const publisherOptions = computed(() =>
  buildCodeOptions(
    books.value
      .map((item) => getBookPublisherPair(item))
      .filter((item) => item.value),
  ),
);
const authorOptions = computed(() =>
  buildCodeOptions(books.value.flatMap((item) => getBookAuthorPairs(item))),
);
const authorLabelMap = computed(
  () => new Map(authorOptions.value.map((item) => [item.value, item.label])),
);
const isBorrowDialogOpen = computed(() => Boolean(borrowDialogBook.value));
const borrowDialogBookTitle = computed(() =>
  String(borrowDialogBook.value?.TENSACH || "quyen sach nay").trim(),
);

const featuredAuthors = computed(() => {
  const frequencyMap = new Map();

  books.value.forEach((item) => {
    getBookAuthorCodes(item).forEach((authorCode) => {
      frequencyMap.set(authorCode, (frequencyMap.get(authorCode) || 0) + 1);
    });
  });

  return [...frequencyMap.entries()]
    .sort(
      (a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "vi"),
    )
    .map(([code]) => ({
      value: code,
      label: authorLabelMap.value.get(code) || code,
    }))
    .slice(0, 8);
});

const searchedAuthors = computed(() => {
  const query = normalizeText(authorSearchText.value);
  if (!query) {
    return [];
  }

  return authorOptions.value
    .filter((author) => normalizeText(author.label).includes(query))
    .slice(0, 10);
});

const filterSections = computed(() => [
  {
    key: "statuses",
    title: "Trạng thái",
    options: statusOptions,
    selected: selectedStatuses.value,
  },
  {
    key: "genres",
    title: "Thể loại",
    options: genreOptions.value,
    selected: selectedGenres.value,
  },
  {
    key: "publishers",
    title: "Nhà xuất bản",
    options: publisherOptions.value,
    selected: selectedPublishers.value,
  },
]);

const filteredBooks = computed(() => {
  let data = books.value.filter((book) => {
    const bookGenres = getBookGenreCodes(book);
    const bookAuthors = getBookAuthorCodes(book);
    const bookAuthorNames = getBookAuthorNames(book);
    const publisherCode = getBookPublisherCode(book);
    const matchesSearch =
      !searchText.value ||
      [book.TENSACH || "", ...bookAuthorNames]
        .join(" ")
        .toLowerCase()
        .includes(searchText.value.toLowerCase());

    const matchesGenre =
      !selectedGenres.value.length ||
      selectedGenres.value.some((item) => bookGenres.includes(item));

    const matchesPublisher =
      !selectedPublishers.value.length ||
      selectedPublishers.value.includes(publisherCode);

    const matchesAuthor =
      !selectedAuthors.value.length ||
      selectedAuthors.value.some((item) => bookAuthors.includes(item));

    const currentStatus = book.SOQUYEN > 0 ? "available" : "out";
    const matchesStatus =
      !selectedStatuses.value.length ||
      selectedStatuses.value.includes(currentStatus);

    return (
      matchesSearch &&
      matchesGenre &&
      matchesPublisher &&
      matchesAuthor &&
      matchesStatus
    );
  });

  data = [...data].sort((a, b) => {
    if (sortBy.value === "name-asc") {
      return String(a.TENSACH || "").localeCompare(
        String(b.TENSACH || ""),
        "vi",
      );
    }
    if (sortBy.value === "name-desc") {
      return String(b.TENSACH || "").localeCompare(
        String(a.TENSACH || ""),
        "vi",
      );
    }
    if (sortBy.value === "price-asc") {
      return Number(a.DONGIA || 0) - Number(b.DONGIA || 0);
    }
    if (sortBy.value === "price-desc") {
      return Number(b.DONGIA || 0) - Number(a.DONGIA || 0);
    }

    return (
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
    );
  });

  return data;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBooks.value.length / pageSize)),
);

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredBooks.value.slice(start, start + pageSize);
});

const pageRangeLabel = computed(() => {
  const total = filteredBooks.value.length;
  if (!total) return "0 - 0 trên 0 đầu sách";
  const start = (currentPage.value - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  return `${start} - ${end} trên ${total} đầu sách`;
});

watch(filteredBooks, (rows) => {
  const maxPage = Math.max(1, Math.ceil(rows.length / pageSize));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});

watch(
  [
    searchText,
    selectedGenres,
    selectedPublishers,
    selectedAuthors,
    selectedStatuses,
    authorSearchText,
    sortBy,
  ],
  () => {
    currentPage.value = 1;
  },
);

watch(
  () => route.query,
  (query) => {
    const nextSearch = String(query?.q || "").trim();
    const nextGenres = parseCodeQueryArray(query?.genres);
    const nextPublishers = parseCodeQueryArray(query?.publishers);
    const nextAuthors = parseCodeQueryArray(query?.authors);
    const nextStatuses = parseQueryArray(query?.statuses);
    const nextSort = parseSort(query?.sort);
    const nextPage = parsePage(query?.page);

    if (searchText.value !== nextSearch) {
      searchText.value = nextSearch;
    }
    if (!areSameStringArrays(selectedGenres.value, nextGenres)) {
      selectedGenres.value = nextGenres;
    }
    if (!areSameStringArrays(selectedPublishers.value, nextPublishers)) {
      selectedPublishers.value = nextPublishers;
    }
    if (!areSameStringArrays(selectedAuthors.value, nextAuthors)) {
      selectedAuthors.value = nextAuthors;
    }
    if (!areSameStringArrays(selectedStatuses.value, nextStatuses)) {
      selectedStatuses.value = nextStatuses;
    }
    if (sortBy.value !== nextSort) {
      sortBy.value = nextSort;
    }
    if (currentPage.value !== nextPage) {
      currentPage.value = nextPage;
    }
  },
);

watch(
  [
    searchText,
    selectedGenres,
    selectedPublishers,
    selectedAuthors,
    selectedStatuses,
    sortBy,
    currentPage,
  ],
  () => {
    const nextQuery = buildRouteQuery();
    if (isSameQuery(route.query, nextQuery)) return;
    router.replace({ query: nextQuery });
  },
);

function goToPage(page) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber)) return;
  if (pageNumber < 1 || pageNumber > totalPages.value) return;
  currentPage.value = pageNumber;
}

function parseQueryArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  const normalized = String(value || "").trim();
  return normalized ? [normalized] : [];
}

function parseCodeQueryArray(value) {
  return parseQueryArray(value).map((item) => normalizeCode(item));
}

function buildCodeOptions(list) {
  const valueToLabel = new Map();

  list.forEach((item) => {
    const code = normalizeCode(item?.value);
    if (!code) return;
    if (!valueToLabel.has(code)) {
      valueToLabel.set(code, String(item?.label || code).trim() || code);
    }
  });

  return [...valueToLabel.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => String(a.label).localeCompare(String(b.label), "vi"));
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function parseSort(value) {
  const normalized = String(value || "").trim();
  return VALID_SORT_VALUES.includes(normalized) ? normalized : "newest";
}

function parsePage(value) {
  const page = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function areSameStringArrays(a, b) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function normalizeQueryValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  const normalized = String(value || "").trim();
  return normalized ? normalized : "";
}

function buildRouteQuery() {
  const query = {};

  const q = searchText.value.trim();
  if (q) query.q = q;

  if (selectedGenres.value.length) query.genres = [...selectedGenres.value];
  if (selectedPublishers.value.length) {
    query.publishers = [...selectedPublishers.value];
  }
  if (selectedAuthors.value.length) query.authors = [...selectedAuthors.value];
  if (selectedStatuses.value.length)
    query.statuses = [...selectedStatuses.value];

  if (sortBy.value !== "newest") query.sort = sortBy.value;
  if (currentPage.value > 1) query.page = String(currentPage.value);

  return query;
}

function isSameQuery(currentQuery, nextQuery) {
  const keys = [
    ...new Set([...Object.keys(currentQuery), ...Object.keys(nextQuery)]),
  ].sort();

  return keys.every((key) => {
    const currentValue = normalizeQueryValue(currentQuery[key]);
    const nextValue = normalizeQueryValue(nextQuery[key]);

    if (Array.isArray(currentValue) || Array.isArray(nextValue)) {
      if (!Array.isArray(currentValue) || !Array.isArray(nextValue)) {
        return false;
      }
      return areSameStringArrays(currentValue, nextValue);
    }

    return currentValue === nextValue;
  });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function getBookAuthorPairs(book) {
  const authorCodes = toArrayField(book?.TACGIA).map((item) =>
    normalizeCode(item),
  );
  const authorNames = toArrayField(book?.TACGIA_TEN);

  return authorCodes.map((code, index) => ({
    value: code,
    label: authorNames[index] || code,
  }));
}

function getBookGenrePairs(book) {
  const genreCodes = toArrayField(book?.THELOAI).map((item) =>
    normalizeCode(item),
  );
  const genreNames = toArrayField(book?.THELOAI_TEN);

  return genreCodes.map((code, index) => ({
    value: code,
    label: genreNames[index] || code,
  }));
}

function getBookPublisherPair(book) {
  const code = normalizeCode(book?.MANXB);
  const label = String(book?.MANXB_TEN || code).trim();

  return {
    value: code,
    label: label || code,
  };
}

function getBookGenreCodes(book) {
  return getBookGenrePairs(book).map((item) => item.value);
}

function getBookAuthorCodes(book) {
  return getBookAuthorPairs(book).map((item) => item.value);
}

function getBookAuthorNames(book) {
  return getBookAuthorPairs(book).map((item) => item.label);
}

function getBookPublisherCode(book) {
  return getBookPublisherPair(book).value;
}

function updateFilter(key, value) {
  if (key === "statuses") {
    selectedStatuses.value = value;
    return;
  }
  if (key === "genres") {
    selectedGenres.value = value;
    return;
  }
  if (key === "publishers") {
    selectedPublishers.value = value;
  }
}

function toggleAuthor(authorName) {
  const normalized = normalizeCode(authorName);
  if (!normalized) return;

  if (selectedAuthors.value.includes(normalized)) {
    selectedAuthors.value = selectedAuthors.value.filter(
      (item) => item !== normalized,
    );
    return;
  }

  selectedAuthors.value = [...selectedAuthors.value, normalized];
}

function parseBorrowResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function borrowStatusForBook(masach) {
  if (!masach) return "";
  return myBorrowStatusByBook.value[masach] || "";
}

async function fetchMyBorrowStatuses() {
  if (!authStore.isLoggedIn || !authStore.isReader) {
    myBorrowStatusByBook.value = {};
    return;
  }

  try {
    const { data } = await api.get("/borrows/my");
    const items = parseBorrowResponse(data);
    const statusMap = {};

    items.forEach((item) => {
      const status = String(item?.TRANGTHAI || "").toUpperCase();
      const masach = item?.SACH?.MASACH || item?.MASACH;

      if (!masach || !ACTIVE_BORROW_STATUSES.includes(status)) return;

      if (!statusMap[masach]) {
        statusMap[masach] = status;
      }
    });

    myBorrowStatusByBook.value = statusMap;
  } catch {
    myBorrowStatusByBook.value = {};
  }
}

async function handleBorrowFromCard(book) {
  if (!book?.MASACH) return;

  borrowDialogBook.value = book;
  borrowDialogType.value = "confirm";
  borrowDialogMessage.value = "";
  borrowDialogSubmitting.value = false;
}

function closeBorrowDialog() {
  if (borrowDialogSubmitting.value) return;

  borrowDialogBook.value = null;
  borrowDialogType.value = "confirm";
  borrowDialogMessage.value = "";
}

async function confirmBorrowFromDialog() {
  if (!borrowDialogBook.value?.MASACH) return;

  if (!authStore.isLoggedIn) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value = "Vui lòng đăng nhập để đăng ký mượn sách.";
    return;
  }

  if (!authStore.isReader) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value =
      "Tài khoản hiện tại không thuộc nhóm bạn đọc để đăng ký mượn.";
    return;
  }

  const currentStatus = borrowStatusForBook(borrowDialogBook.value.MASACH);
  if (ACTIVE_BORROW_STATUSES.includes(currentStatus)) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value =
      "Bạn đã có phiếu mượn hoặc yêu cầu đang hoạt động cho sách này.";
    return;
  }

  borrowDialogSubmitting.value = true;

  try {
    await api.post("/borrows/request", {
      MASACH: borrowDialogBook.value.MASACH,
    });
    borrowDialogType.value = "success";
    borrowDialogMessage.value =
      "Đã đăng kí mượn thành công, vui lòng theo dõi trang Mượn của tôi để xem cập nhật trạng thái.";
    await fetchMyBorrowStatuses();
  } catch (error) {
    borrowDialogType.value = "error";
    borrowDialogMessage.value =
      error?.response?.data?.message || "Không thể gửi yêu cầu mượn lúc này.";
  } finally {
    borrowDialogSubmitting.value = false;
  }
}

function goToBookDetail(book) {
  if (!book?._id) return;
  router.push(`/books/${book._id}`);
}

function voteAverage(masach) {
  return voteSummaryByMasach.value[masach]?.averageScore || 0;
}

function voteCount(masach) {
  return voteSummaryByMasach.value[masach]?.totalVotes || 0;
}

async function fetchVoteSummaries(list) {
  const entries = await Promise.all(
    list
      .filter((item) => item.MASACH)
      .map(async (item) => {
        try {
          const { data } = await api.get(`/votes/books/${item.MASACH}`);
          return [
            item.MASACH,
            {
              averageScore: Number(data?.averageScore || 0),
              totalVotes: Number(data?.totalVotes || 0),
            },
          ];
        } catch {
          return [item.MASACH, { averageScore: 0, totalVotes: 0 }];
        }
      }),
  );

  voteSummaryByMasach.value = Object.fromEntries(entries);
}

function resetFilters() {
  searchText.value = "";
  selectedGenres.value = [];
  selectedPublishers.value = [];
  selectedAuthors.value = [];
  selectedStatuses.value = [];
  authorSearchText.value = "";
  sortBy.value = "newest";
}

async function fetchBooks() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("/books");
    books.value = Array.isArray(response.data) ? response.data : [];
    await fetchVoteSummaries(books.value);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể tải danh sách sách. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([fetchBooks(), fetchMyBorrowStatuses()]);
});
</script>
