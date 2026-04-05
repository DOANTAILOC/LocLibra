<template>
  <main class="container mx-auto px-4 py-10 md:py-12">
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
        :vote-summary="voteSummary"
        @borrow="handleBorrow"
      >
        <BookDetailSpecs :detail-items="detailItems" />

        <BookVotesSection
          :vote-summary="voteSummary"
          :selected-score="selectedScore"
          :voting="voting"
          :is-logged-in="authStore.isLoggedIn"
          :my-vote-score="myVoteScore"
          :vote-message="voteMessage"
          @update:selected-score="selectedScore = $event"
          @submit-vote="submitVote"
          @remove-vote="removeVote"
          @go-login="router.push('/login')"
        />
      </BookOverviewSection>

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
              class="mb-3 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
            >
              <img
                :src="coverByBook(item)"
                :alt="item.TENSACH"
                class="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
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
              {{ item.TACGIA || "Chưa rõ" }}
            </p>
          </article>
        </div>
      </section>
    </section>
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const borrowing = ref(false);
const voting = ref(false);
const errorMessage = ref("");
const book = ref(null);
const relatedBooks = ref([]);
const selectedScore = ref(0);
const voteMessage = ref("");

const voteSummary = reactive({
  averageScore: "0.0",
  totalVotes: 0,
  voters: [],
});

const isAvailable = computed(() => Number(book.value?.SOQUYEN || 0) > 0);
const detailItems = computed(() => {
  if (!book.value) return [];

  return [
    { label: "Mã sách", value: book.value.MASACH || "Chưa rõ" },
    { label: "Thể loại", value: book.value.THELOAI || "Chưa phân loại" },
    { label: "Nhà xuất bản", value: book.value.MANXB || "Chưa rõ" },
    { label: "Năm xuất bản", value: book.value.NAMXUATBAN || "Chưa rõ" },
    { label: "Đơn giá", value: formatCurrency(book.value.DONGIA) },
    { label: "Số lượng", value: `${book.value.SOQUYEN || 0} cuốn` },
    {
      label: "Trạng thái",
      value: isAvailable.value ? "Đang có sẵn" : "Hết sách",
    },
    { label: "Ngày tạo", value: formatDate(book.value.created_at) },
    { label: "Ngày cập nhật", value: formatDate(book.value.updated_at) },
  ];
});
const currentAccountId = computed(() => authStore.user?.account?.id || null);
const myVoteScore = computed(() => {
  if (!currentAccountId.value) return 0;

  const mine = voteSummary.voters.find(
    (voter) => String(voter.accountId) === String(currentAccountId.value),
  );

  return mine?.score || 0;
});

const bookCover = computed(() => {
  if (!book.value) return "";
  return coverByBook(book.value);
});

function coverByBook(item) {
  if (item?.ANHBIA_URL) {
    return item.ANHBIA_URL;
  }

  const seed = encodeURIComponent(item.MASACH || item.TENSACH || "book");
  return `https://picsum.photos/seed/${seed}/900/1300`;
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
  selectedScore.value = myVoteScore.value || selectedScore.value;
}

async function handleBorrow() {
  if (!book.value || !isAvailable.value) return;

  borrowing.value = true;
  try {
    await api.post("/borrows/request", { MASACH: book.value.MASACH });
    window.alert("Đã gửi yêu cầu mượn sách thành công.");
  } catch (error) {
    window.alert(
      error?.response?.data?.message || "Không thể gửi yêu cầu mượn lúc này.",
    );
  } finally {
    borrowing.value = false;
  }
}

async function submitVote() {
  if (!authStore.isLoggedIn) {
    voteMessage.value = "Vui lòng đăng nhập để đánh giá sách.";
    router.push("/login");
    return;
  }

  if (!book.value?.MASACH || selectedScore.value < 1) return;

  voting.value = true;
  voteMessage.value = "";

  try {
    const { data } = await api.post(`/votes/books/${book.value.MASACH}`, {
      score: selectedScore.value,
    });
    applyVoteSummary(data);
    voteMessage.value = "Đánh giá của bạn đã được lưu.";
  } catch (error) {
    if (error?.response?.status === 401) {
      voteMessage.value = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      router.push("/login");
      return;
    }

    if (error?.response?.status === 404) {
      voteMessage.value =
        "Chức năng vote chưa sẵn sàng trên server. Hãy khởi động lại backend và thử lại.";
      return;
    }

    voteMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể gửi đánh giá lúc này.";
  } finally {
    voting.value = false;
  }
}

async function removeVote() {
  if (!book.value?.MASACH) return;

  voting.value = true;
  voteMessage.value = "";

  try {
    const { data } = await api.delete(`/votes/books/${book.value.MASACH}`);
    applyVoteSummary(data);
    selectedScore.value = 0;
    voteMessage.value = "Đã hủy vote của bạn.";
  } catch (error) {
    if (error?.response?.status === 401) {
      voteMessage.value = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      router.push("/login");
      return;
    }

    if (error?.response?.status === 404) {
      voteMessage.value =
        "Chức năng vote chưa sẵn sàng trên server. Hãy khởi động lại backend và thử lại.";
      return;
    }

    voteMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể hủy vote lúc này.";
  } finally {
    voting.value = false;
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
        .get("/books", { params: { theloai: data.THELOAI } })
        .catch(() => ({ data: [] })),
    ]);

    applyVoteSummary(voteRes.data);

    relatedBooks.value = (Array.isArray(relatedRes.data) ? relatedRes.data : [])
      .filter((item) => item._id !== data._id)
      .slice(0, 5);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Không thể tải trang chi tiết sách.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBookDetail);
</script>
