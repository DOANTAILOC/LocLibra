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
            v-for="book in filteredBooks"
            :key="book._id || book.MASACH"
            :book="book"
            :average-score="voteAverage(book.MASACH)"
            :total-votes="voteCount(book.MASACH)"
            @detail="goToBookDetail"
            @borrow="handleBorrowFromCard"
          />
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import SearchBar from "../components/books/SearchBar.vue";
import FilterSection from "../components/books/FilterSection.vue";
import ResultToolbar from "../components/books/ResultToolbar.vue";
import BookCard from "../components/books/BookCard.vue";

const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");
const books = ref([]);
const voteSummaryByMasach = ref({});

const searchText = ref("");
const selectedGenres = ref([]);
const selectedPublishers = ref([]);
const selectedAuthors = ref([]);
const selectedStatuses = ref([]);
const sortBy = ref("newest");

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
  uniqueValues(books.value.flatMap((item) => toArrayField(item.THELOAI))),
);
const publisherOptions = computed(() =>
  uniqueValues(books.value.map((item) => item.MANXB)),
);
const authorOptions = computed(() =>
  uniqueValues(books.value.flatMap((item) => toArrayField(item.TACGIA))),
);

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
  {
    key: "authors",
    title: "Tác giả",
    options: authorOptions.value.map((item) => ({ label: item, value: item })),
    selected: selectedAuthors.value,
  },
]);

const filteredBooks = computed(() => {
  let data = books.value.filter((book) => {
    const bookGenres = toArrayField(book.THELOAI);
    const bookAuthors = toArrayField(book.TACGIA);
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
      selectedPublishers.value.includes(book.MANXB);

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

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "vi"),
  );
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
    return;
  }
  if (key === "authors") {
    selectedAuthors.value = value;
  }
}

async function handleBorrowFromCard(book) {
  if (!book?.MASACH) return;

  try {
    await api.post("/borrows/request", { MASACH: book.MASACH });
    window.alert("Đã gửi yêu cầu mượn sách thành công.");
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

onMounted(fetchBooks);
</script>
