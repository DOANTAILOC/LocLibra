<template>
  <main>
    <section class="relative min-h-[620px] overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          class="h-full w-full object-cover brightness-[0.9]"
          src="/banner.jpg"
          alt="Không gian thư viện"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_bottom,_rgb(9_10_7/36%),_rgb(9_10_7/12%))]"
        ></div>
        <div
          class="absolute inset-y-0 left-0 w-[62%] bg-[linear-gradient(to_right,_rgb(7_8_5/88%),_rgb(7_8_5/68%)_45%,_rgb(7_8_5/0)_100%)]"
        ></div>
        <div
          class="absolute inset-y-0 right-0 w-[40%] bg-[linear-gradient(to_left,_rgb(254_253_241/14%),_rgb(254_253_241/0)_75%)]"
        ></div>
      </div>

      <div
        class="container relative z-10 mx-auto flex min-h-[620px] items-center px-4 py-12"
      >
        <div class="w-full max-w-3xl space-y-8 text-[var(--surface)]">
          <p class="text-xs font-bold tracking-[0.22em] uppercase opacity-90">
            Hệ thống thư viện LocLibrary
          </p>

          <h1
            class="text-4xl leading-tight font-semibold drop-shadow-[0_4px_14px_rgb(0_0_0/68%)] md:text-6xl"
            style="color: var(--inverse-primary)"
          >
            Books are a uniquely portable magic
          </h1>

          <p class="max-w-2xl text-base text-[rgb(254_253_241/85%)] md:text-lg">
            Khám phá sách mới, tác giả nổi bật và các đầu sách được bạn đọc quan
            tâm nhất trong tuần.
          </p>

          <div
            v-if="authStore.isLoggedIn"
            class="glass-panel flex flex-col gap-2 rounded-2xl border border-[rgb(214_232_207/35%)] p-2.5 md:flex-row"
          >
            <div
              class="flex flex-1 items-center gap-2 rounded-xl bg-[var(--surface)] px-4 py-3"
            >
              <span
                class="material-symbols-outlined text-[var(--on-surface-variant)]"
              >
                search
              </span>
              <input
                v-model.trim="heroSearchText"
                class="w-full border-none bg-transparent p-0 text-[var(--on-surface)] outline-none"
                type="text"
                placeholder="Tìm theo tên sách, tác giả hoặc mã sách..."
                @keyup.enter="goToCatalogFromHero"
              />
            </div>

            <button
              type="button"
              class="btn-primary rounded-xl px-8 py-3 text-xs"
              @click="goToCatalogFromHero"
            >
              Tìm kiếm
            </button>
          </div>

          <div v-else class="flex flex-wrap items-center gap-3">
            <RouterLink to="/register" class="btn-primary px-8 py-3 text-xs">
              Đăng ký ngay
            </RouterLink>
            <RouterLink
              to="/login"
              class="rounded-xl border border-[rgb(254_253_241/40%)] px-6 py-3 text-xs font-bold tracking-[0.08em] uppercase text-[var(--surface)] transition hover:bg-[rgb(254_253_241/12%)]"
            >
              Đăng nhập
            </RouterLink>
          </div>

          <div class="flex flex-wrap gap-2 text-xs tracking-[0.12em] uppercase">
            <span class="rounded-full bg-[rgb(254_253_241/14%)] px-3 py-1.5"
              >Văn học</span
            >
            <span class="rounded-full bg-[rgb(254_253_241/14%)] px-3 py-1.5"
              >Lịch sử</span
            >
            <span class="rounded-full bg-[rgb(254_253_241/14%)] px-3 py-1.5"
              >Triết học</span
            >
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 py-16" id="about-us">
      <div class="mb-10 flex items-end justify-between gap-4">
        <div>
          <p
            class="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase"
          >
            Bổ sung mới nhất
          </p>
          <h2 class="mt-2 text-3xl">Sách Mới Cập Nhật</h2>
        </div>
        <RouterLink
          to="/books"
          class="inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] transition hover:gap-2"
        >
          Xem tất cả
          <span class="material-symbols-outlined text-base">arrow_forward</span>
        </RouterLink>
      </div>

      <div
        v-if="loading"
        class="panel-surface p-5 text-sm text-[var(--on-surface-variant)]"
      >
        Đang tải dữ liệu trang chủ...
      </div>

      <div
        v-else-if="!latestBooks.length"
        class="panel-surface p-5 text-sm text-[var(--on-surface-variant)]"
      >
        Chưa có dữ liệu sách để hiển thị.
      </div>

      <div v-else class="space-y-5">
        <div class="flex items-center gap-3 md:gap-5">
          <button
            v-if="latestBooks.length > 1"
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            :disabled="latestPage <= 0"
            @click="goPrevLatestPage"
          >
            <span class="material-symbols-outlined text-base"
              >chevron_left</span
            >
          </button>

          <div class="flex-1 overflow-hidden">
            <div
              class="flex gap-6 transition-transform duration-500 ease-out"
              :style="{ transform: `translateX(-${latestSlidePercent}%)` }"
            >
              <article
                v-for="book in latestBooks"
                :key="book._id"
                class="group cursor-pointer"
                :style="{
                  flex: `0 0 calc(${100 / latestVisibleCount}% - 18px)`,
                }"
                @click="goToBook(book)"
              >
                <div
                  class="mb-5 aspect-[3/4] overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
                >
                  <img
                    :src="bookCover(book)"
                    :alt="book.TENSACH"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p
                  class="text-[11px] font-bold tracking-[0.12em] text-[var(--on-surface-variant)] uppercase"
                >
                  {{ firstGenre(book) }}
                </p>
                <h3
                  class="mt-1 text-xl leading-tight group-hover:text-[var(--primary)]"
                >
                  {{ book.TENSACH }}
                </h3>
                <p class="mt-1 text-sm text-[var(--on-surface-variant)]">
                  Tác giả: {{ firstAuthor(book) }}
                </p>
              </article>
            </div>
          </div>

          <button
            v-if="latestBooks.length > 1"
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            :disabled="latestPage >= latestMaxStart"
            @click="goNextLatestPage"
          >
            <span class="material-symbols-outlined text-base">
              chevron_right
            </span>
          </button>
        </div>

        <div
          v-if="latestDotCount > 1"
          class="flex items-center justify-center gap-2"
        >
          <button
            v-for="(_, pageIndex) in Array.from({ length: latestDotCount })"
            :key="`latest-dot-${pageIndex}`"
            type="button"
            class="h-2.5 w-2.5 rounded-full transition"
            :class="
              pageIndex === latestPage
                ? 'bg-[var(--primary)]'
                : 'bg-[rgb(184_188_163/70%)] hover:bg-[rgb(184_188_163/95%)]'
            "
            :aria-label="`Đi tới trang ${pageIndex + 1}`"
            @click="latestPage = pageIndex"
          ></button>
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface-container)] py-16">
      <div class="container mx-auto px-4">
        <div class="mb-10 text-center">
          <h2 class="text-3xl">Được mượn đọc nhiều nhất</h2>
          <p
            class="mx-auto mt-2 max-w-xl text-sm text-[var(--on-surface-variant)]"
          >
            Xếp hạng theo số lượt mượn thực tế trong hệ thống thư viện.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <article
            v-for="book in trendingBooks"
            :key="`trending-${book._id}`"
            class="flex min-h-[340px] cursor-pointer flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3 transition hover:-translate-y-1"
            @click="goToBook(book)"
          >
            <img
              :src="bookCover(book)"
              :alt="book.TENSACH"
              class="mb-3 aspect-[2/3] w-full rounded-lg object-cover"
            />
            <p class="line-clamp-2 text-sm font-bold text-[var(--on-surface)]">
              {{ book.TENSACH }}
            </p>
            <p
              class="mt-1 line-clamp-1 text-xs text-[var(--on-surface-variant)]"
            >
              Tác giả: {{ firstAuthor(book) }}
            </p>
            <p class="mt-auto pt-3 text-xs font-semibold text-[var(--primary)]">
              {{ borrowCount(book.MASACH) }} lượt mượn
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 py-16">
      <h2 class="mb-10 text-3xl">Sách Được Đánh Giá Cao Nhất</h2>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.6fr]">
        <div class="space-y-6">
          <article
            v-for="(book, index) in topRatedBooks"
            :key="`top-${book._id}`"
            class="cursor-pointer rounded-xl border border-transparent p-4 transition"
            :class="
              selectedTopRatedBook?._id === book._id
                ? 'border-[var(--primary)] bg-[var(--surface-container)]'
                : 'border-[rgb(184_188_163/25%)] hover:border-[rgb(184_188_163/55%)]'
            "
            @click="selectTopRatedBook(book)"
          >
            <div class="flex items-start gap-4">
              <span class="text-4xl text-[rgb(127_131_108/45%)]">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <div>
                <h3 class="text-xl font-bold">{{ book.TENSACH }}</h3>
                <p class="text-sm text-[var(--on-surface-variant)]">
                  {{ firstAuthor(book) }}
                </p>
                <p class="mt-1 text-sm font-semibold text-[var(--primary)]">
                  {{ voteAverage(book.MASACH).toFixed(1) }} / 5
                </p>
              </div>
            </div>
          </article>
        </div>

        <article
          v-if="selectedTopRatedBook"
          class="panel-surface h-full min-h-[560px] rounded-3xl p-6"
        >
          <div class="grid h-full grid-cols-1 gap-6 md:grid-cols-[340px_1fr]">
            <div
              class="overflow-hidden rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
            >
              <img
                :src="bookCover(selectedTopRatedBook)"
                :alt="selectedTopRatedBook.TENSACH"
                class="h-full min-h-[460px] w-full object-cover"
              />
            </div>

            <div class="flex h-full flex-col gap-4">
              <p
                class="inline-flex self-start rounded-full bg-[var(--primary-container)] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[var(--on-primary-container)] uppercase"
              >
                Sách tiêu biểu theo đánh giá
              </p>
              <h3 class="text-3xl leading-tight">
                {{ selectedTopRatedBook.TENSACH }}
              </h3>
              <p class="text-sm text-[var(--on-surface-variant)]">
                Tác giả: {{ firstAuthor(selectedTopRatedBook) }}
              </p>
              <p class="text-sm text-[var(--on-surface-variant)]">
                Nhà xuất bản: {{ selectedTopRatedBook.MANXB_TEN || "Không rõ" }}
              </p>
              <p class="text-sm text-[var(--on-surface-variant)]">
                Năm xuất bản:
                {{ selectedTopRatedBook.NAMXUATBAN || "Không rõ" }}
              </p>
              <p class="text-sm font-semibold text-[var(--primary)]">
                Điểm đánh giá:
                {{ voteAverage(selectedTopRatedBook.MASACH).toFixed(1) }} / 5
              </p>
              <p
                class="line-clamp-10 flex-1 text-sm leading-relaxed text-[var(--on-surface)]"
              >
                {{
                  selectedTopRatedBook.MOTA_NGAN ||
                  "Chưa có mô tả ngắn cho đầu sách này."
                }}
              </p>

              <div class="mt-auto pt-2">
                <button
                  type="button"
                  class="btn-primary rounded-xl px-6 py-3 text-xs"
                  @click="goBorrowNow(selectedTopRatedBook)"
                >
                  Mượn ngay
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section
      class="border-t border-[rgb(184_188_163/25%)] bg-[var(--surface-container-low)] py-16"
    >
      <div class="container mx-auto px-4">
        <h2 class="mb-10 text-center text-3xl">Tác Giả Nổi Bật</h2>

        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">
          <article
            v-for="author in featuredAuthors"
            :key="author.name"
            class="flex flex-col items-center gap-3 text-center"
          >
            <div
              class="h-24 w-24 overflow-hidden rounded-full border-2 border-[rgb(184_188_163/35%)] bg-[var(--surface-container-high)] p-1"
            >
              <img
                :src="author.avatar"
                :alt="author.name"
                class="h-full w-full rounded-full object-cover"
              />
            </div>
            <p class="text-sm font-bold">{{ author.name }}</p>
            <p class="text-xs text-[var(--on-surface-variant)]">
              {{ author.count }} đầu sách
            </p>
          </article>
        </div>
      </div>
    </section>

    <AppFooter />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import AppFooter from "../components/shared/AppFooter.vue";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const books = ref([]);
const voteSummaryByMasach = ref({});
const borrowSummaryByMasach = ref({});
const heroSearchText = ref("");
const latestPage = ref(0);
const latestVisibleDesktop = 4;
const selectedTopRatedBookId = ref("");
let latestAutoSlideTimer = null;
let latestAutoDirection = 1;

const latestBooks = computed(() => {
  return [...books.value]
    .sort((a, b) => {
      const aTime = new Date(a?.created_at || 0).getTime();
      const bTime = new Date(b?.created_at || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 8);
});

const latestVisibleCount = computed(() => {
  const total = latestBooks.value.length;
  if (!total) return 1;
  return Math.min(latestVisibleDesktop, total);
});

const latestMaxStart = computed(() => {
  return Math.max(0, latestBooks.value.length - latestVisibleCount.value);
});

const latestDotCount = computed(() => latestMaxStart.value + 1);

const latestSlidePercent = computed(() => {
  return latestPage.value * (100 / latestVisibleCount.value);
});

const trendingBooks = computed(() => {
  return [...books.value]
    .sort((a, b) => borrowCount(b.MASACH) - borrowCount(a.MASACH))
    .slice(0, 6);
});

const topRatedBooks = computed(() => {
  return [...books.value]
    .sort((a, b) => voteAverage(b.MASACH) - voteAverage(a.MASACH))
    .slice(0, 5);
});

const selectedTopRatedBook = computed(() => {
  const selected = topRatedBooks.value.find(
    (item) => item?._id === selectedTopRatedBookId.value,
  );
  return selected || topRatedBooks.value[0] || null;
});

const featuredAuthors = computed(() => {
  const authorMap = new Map();

  books.value.forEach((book) => {
    const details = Array.isArray(book?.TACGIA_CHI_TIET)
      ? book.TACGIA_CHI_TIET
      : [];
    if (details.length) {
      details.forEach((item) => {
        const name = String(item?.name || "").trim();
        if (!name) return;

        const current = authorMap.get(name) || { count: 0, avatar: "" };
        authorMap.set(name, {
          count: current.count + 1,
          avatar: String(item?.avatarUrl || current.avatar || "").trim(),
        });
      });
      return;
    }

    toArrayField(book?.TACGIA_TEN || book?.TACGIA).forEach((name) => {
      const current = authorMap.get(name) || { count: 0, avatar: "" };
      authorMap.set(name, { count: current.count + 1, avatar: current.avatar });
    });
  });

  return [...authorMap.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], "vi"))
    .slice(0, 5)
    .map(([name, item]) => ({
      name,
      count: item.count,
      avatar:
        item.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=53634f&color=ffffff&rounded=true&bold=true&size=192&format=png`,
    }));
});

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

function firstGenre(book) {
  return (
    toArrayField(book?.THELOAI_TEN || book?.THELOAI)[0] || "Chưa phân loại"
  );
}

function firstAuthor(book) {
  const fromDetails = Array.isArray(book?.TACGIA_CHI_TIET)
    ? book.TACGIA_CHI_TIET.map((item) =>
        String(item?.name || "").trim(),
      ).filter(Boolean)
    : [];
  if (fromDetails.length) return fromDetails[0];
  return toArrayField(book?.TACGIA_TEN || book?.TACGIA)[0] || "Chưa rõ tác giả";
}

function bookCover(book) {
  if (book?.ANHBIA_URL) return book.ANHBIA_URL;
  const seed = encodeURIComponent(book?.MASACH || book?.TENSACH || "book");
  return `https://picsum.photos/seed/${seed}/600/900`;
}

function voteAverage(masach) {
  return Number(voteSummaryByMasach.value[masach]?.averageScore || 0);
}

function voteCount(masach) {
  return Number(voteSummaryByMasach.value[masach]?.totalVotes || 0);
}

function borrowCount(masach) {
  return Number(borrowSummaryByMasach.value[masach] || 0);
}

function goPrevLatestPage() {
  if (!latestBooks.value.length) return;
  latestPage.value = Math.max(0, latestPage.value - 1);
  latestAutoDirection = -1;
}

function goNextLatestPage() {
  if (!latestBooks.value.length) return;
  latestPage.value = Math.min(latestMaxStart.value, latestPage.value + 1);
  latestAutoDirection = 1;
}

function startLatestAutoSlide() {
  if (latestAutoSlideTimer) {
    clearInterval(latestAutoSlideTimer);
    latestAutoSlideTimer = null;
  }

  if (latestDotCount.value <= 1) return;
  latestAutoSlideTimer = setInterval(() => {
    if (latestPage.value >= latestMaxStart.value) {
      latestAutoDirection = -1;
    } else if (latestPage.value <= 0) {
      latestAutoDirection = 1;
    }

    latestPage.value += latestAutoDirection;
  }, 3500);
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

async function fetchBorrowSummaries() {
  try {
    const { data } = await api.get("/books/borrow-stats");
    const items = Array.isArray(data?.items) ? data.items : [];
    const map = {};

    items.forEach((item) => {
      const masach = String(item?.MASACH || "").trim();
      if (!masach) return;
      map[masach] = Number(item?.totalBorrows || 0);
    });

    borrowSummaryByMasach.value = map;
  } catch {
    borrowSummaryByMasach.value = {};
  }
}

async function fetchBooks() {
  loading.value = true;
  try {
    const { data } = await api.get("/books");
    books.value = Array.isArray(data) ? data : [];
    await Promise.all([
      fetchVoteSummaries(books.value),
      fetchBorrowSummaries(),
    ]);
  } catch {
    books.value = [];
    voteSummaryByMasach.value = {};
    borrowSummaryByMasach.value = {};
  } finally {
    loading.value = false;
  }
}

function selectTopRatedBook(book) {
  selectedTopRatedBookId.value = String(book?._id || "");
}

function goBorrowNow(book) {
  if (!book?._id) return;
  router.push(`/books/${book._id}`);
}

function goToBook(book) {
  if (!book?._id) return;
  router.push(`/books/${book._id}`);
}

function goToCatalogFromHero() {
  const query = String(heroSearchText.value || "").trim();
  if (!query) {
    router.push("/books");
    return;
  }

  router.push({
    path: "/books",
    query: { q: query },
  });
}

onMounted(() => {
  fetchBooks();
  startLatestAutoSlide();
});

onBeforeUnmount(() => {
  if (latestAutoSlideTimer) {
    clearInterval(latestAutoSlideTimer);
    latestAutoSlideTimer = null;
  }
});

watch(latestBooks, () => {
  const maxPage = latestMaxStart.value;
  if (latestPage.value > maxPage) {
    latestPage.value = maxPage;
  }
  if (latestPage.value <= 0) {
    latestAutoDirection = 1;
  }
  startLatestAutoSlide();
});

watch(topRatedBooks, (list) => {
  if (!list.length) {
    selectedTopRatedBookId.value = "";
    return;
  }

  const exists = list.some(
    (item) => item?._id === selectedTopRatedBookId.value,
  );
  if (!exists) {
    selectedTopRatedBookId.value = String(list[0]._id || "");
  }
});
</script>
