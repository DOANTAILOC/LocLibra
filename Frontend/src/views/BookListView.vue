<template>
  <main class="container mx-auto px-4 py-10 md:py-12">
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

    <SearchBar
      v-model="searchText"
      placeholder="Tìm theo tên sách hoặc tác giả..."
      :show-button="true"
      button-label="Tìm kiếm"
    />

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
                :key="author"
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                :class="
                  selectedAuthors.includes(author)
                    ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                    : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                "
                @click="toggleAuthor(author)"
              >
                {{ author }}
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
                :key="author"
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
              >
                <input
                  :checked="selectedAuthors.includes(author)"
                  type="checkbox"
                  class="h-4 w-4 rounded border-[var(--outline-variant)] text-[var(--primary)] focus:ring-[var(--primary-container)]"
                  @change="toggleAuthor(author)"
                />
                <span>{{ author }}</span>
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
        <ResultToolbar
          :total="filteredBooks.length"
          :sort-by="sortBy"
          :sort-options="sortOptions"
          @update:sort-by="sortBy = $event"
        />

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
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import SearchBar from "../components/books/SearchBar.vue";
import FilterSection from "../components/books/FilterSection.vue";
import ResultToolbar from "../components/books/ResultToolbar.vue";
import BookCard from "../components/books/BookCard.vue";
import PaginationBar from "../components/shared/PaginationBar.vue";

const router = useRouter();
const authStore = useAuthStore();
const ACTIVE_BORROW_STATUSES = ["PENDING", "APPROVED", "BORROWING", "OVERDUE"];

const loading = ref(false);
const errorMessage = ref("");
const books = ref([]);
const voteSummaryByMasach = ref({});
const myBorrowStatusByBook = ref({});

const searchText = ref("");
const selectedGenres = ref([]);
const selectedPublishers = ref([]);
const selectedAuthors = ref([]);
const selectedStatuses = ref([]);
const authorSearchText = ref("");
const sortBy = ref("newest");
const pageSize = 12;
const currentPage = ref(1);

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
  uniqueValues(books.value.flatMap((item) => getBookGenreNames(item))),
);
const publisherOptions = computed(() =>
  uniqueValues(books.value.map((item) => getBookPublisherName(item))),
);
const authorOptions = computed(() =>
  uniqueValues(books.value.flatMap((item) => getBookAuthorNames(item))),
);

const featuredAuthors = computed(() => {
  const frequencyMap = new Map();

  books.value.forEach((item) => {
    getBookAuthorNames(item).forEach((author) => {
      frequencyMap.set(author, (frequencyMap.get(author) || 0) + 1);
    });
  });

  return [...frequencyMap.entries()]
    .sort(
      (a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "vi"),
    )
    .map(([name]) => name)
    .slice(0, 8);
});

const searchedAuthors = computed(() => {
  const query = normalizeText(authorSearchText.value);
  if (!query) {
    return [];
  }

  return authorOptions.value
    .filter((author) => normalizeText(author).includes(query))
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
    options: genreOptions.value.map((item) => ({ label: item, value: item })),
    selected: selectedGenres.value,
  },
  {
    key: "publishers",
    title: "Nhà xuất bản",
    options: publisherOptions.value.map((item) => ({
      label: item,
      value: item,
    })),
    selected: selectedPublishers.value,
  },
]);

const filteredBooks = computed(() => {
  let data = books.value.filter((book) => {
    const bookGenres = getBookGenreNames(book);
    const bookAuthors = getBookAuthorNames(book);
    const publisherName = getBookPublisherName(book);
    const matchesSearch =
      !searchText.value ||
      [book.TENSACH || "", ...bookAuthors]
        .join(" ")
        .toLowerCase()
        .includes(searchText.value.toLowerCase());

    const matchesGenre =
      !selectedGenres.value.length ||
      selectedGenres.value.some((item) => bookGenres.includes(item));

    const matchesPublisher =
      !selectedPublishers.value.length ||
      selectedPublishers.value.includes(publisherName);

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

function goToPage(page) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber)) return;
  if (pageNumber < 1 || pageNumber > totalPages.value) return;
  currentPage.value = pageNumber;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "vi"),
  );
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

function getBookGenreNames(book) {
  const genreNames = toArrayField(book?.THELOAI_TEN);
  if (genreNames.length) {
    return genreNames;
  }

  return toArrayField(book?.THELOAI);
}

function getBookAuthorNames(book) {
  const authorNames = toArrayField(book?.TACGIA_TEN);
  if (authorNames.length) {
    return authorNames;
  }

  return toArrayField(book?.TACGIA);
}

function getBookPublisherName(book) {
  return String(book?.MANXB_TEN || book?.MANXB || "").trim();
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
  const normalized = String(authorName || "").trim();
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

  const currentStatus = borrowStatusForBook(book.MASACH);
  if (ACTIVE_BORROW_STATUSES.includes(currentStatus)) {
    window.alert("Bạn đã có phiếu mượn/yêu cầu đang hoạt động cho sách này.");
    return;
  }

  try {
    await api.post("/borrows/request", { MASACH: book.MASACH });
    window.alert("Đã gửi yêu cầu mượn sách thành công.");
    await fetchMyBorrowStatuses();
  } catch (error) {
    window.alert(
      error?.response?.data?.message || "Không thể gửi yêu cầu mượn lúc này.",
    );
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
