<template>
  <main class="bg-[var(--background)]">
    <section
      class="relative min-h-[680px] overflow-hidden bg-[var(--surface-container-low)]"
    >
      <div class="absolute inset-0 z-0">
        <img
          class="h-full w-full object-cover opacity-20 grayscale brightness-75"
          src="/banner.jpg"
          alt="Không gian thư viện"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_top,_var(--surface),_rgb(254_253_241/45%),_transparent)]"
        ></div>
      </div>

      <div
        class="container relative z-10 mx-auto flex min-h-[680px] items-center px-4 py-14"
      >
        <div class="max-w-3xl">
          <span
            class="inline-block rounded-full bg-[var(--primary-container)] px-4 py-1 text-xs font-bold tracking-[0.12em] text-[var(--on-primary-container)] uppercase"
          >
            Tầm nhìn và sứ mệnh
          </span>

          <h1 class="mt-6 text-5xl leading-tight font-bold md:text-7xl">
            Hành Trình Gìn Giữ
            <span class="italic text-[var(--primary)]">Tri Thức</span>
          </h1>

          <p
            class="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--on-surface-variant)] md:text-xl"
          >
            LocLibrary là nơi kết nối bạn đọc và tri thức, nơi mỗi đầu sách được
            gìn giữ để tiếp tục hành trình học tập cho cộng đồng.
          </p>

          <RouterLink
            to="/books"
            class="btn-primary mt-10 inline-flex rounded-xl px-8 py-4 text-sm"
          >
            Khám phá kho sách
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface)] py-20">
      <div class="container mx-auto px-4">
        <div
          class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div class="relative">
            <div
              class="aspect-[3/4] overflow-hidden rounded-xl border border-[var(--outline-variant)]"
            >
              <img
                class="h-full w-full object-cover"
                src="/tusach.jpg"
                alt="Giá sách cổ điển"
              />
            </div>
            <div
              class="absolute -right-7 -bottom-7 -z-10 h-36 w-36 rounded-xl bg-[var(--primary-container)]"
            ></div>
          </div>

          <div>
            <h2 class="text-4xl font-bold md:text-5xl">
              Câu Chuyện Của Chúng Tôi
            </h2>
            <div
              class="mt-6 space-y-5 text-base leading-relaxed text-[var(--on-surface-variant)] md:text-lg"
            >
              <p>
                Từ một mong muốn xây dựng thư viện số thân thiện, LocLibrary đã
                phát triển thành nền tảng giúp độc giả tìm kiếm, mượn và theo
                dõi sách dễ dàng hơn mỗi ngày.
              </p>
              <p>
                Hệ thống được xây dựng hướng tới tính chính xác của dữ liệu,
                trải nghiệm sử dụng rõ ràng và khả năng mở rộng để phục vụ ngày
                càng nhiều bạn đọc.
              </p>
              <p class="italic font-medium text-[var(--primary)]">
                "Chúng tôi không chỉ lưu trữ sách, chúng tôi kết nối người đọc
                với tri thức đúng lúc cần."
              </p>
            </div>
            <div class="mt-10 flex items-center gap-3">
              <div class="h-px w-16 bg-[var(--outline-variant)]"></div>
              <p class="font-headline italic text-xl">Đội ngũ LocLibrary</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface-container-low)] py-20">
      <div class="container mx-auto px-4">
        <div class="mb-14 text-center">
          <h2 class="text-4xl font-bold">Giá Trị Cốt Lõi</h2>
          <div
            class="mx-auto mt-4 h-1 w-24 rounded-full bg-[var(--primary)]"
          ></div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article
            v-for="item in coreValues"
            :key="item.title"
            class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 transition hover:-translate-y-1"
          >
            <div
              class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-container)]"
            >
              <span
                class="material-symbols-outlined text-2xl text-[var(--on-primary-container)]"
              >
                {{ item.icon }}
              </span>
            </div>
            <h3 class="text-2xl font-bold">{{ item.title }}</h3>
            <p class="mt-3 leading-relaxed text-[var(--on-surface-variant)]">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface)] py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-8">
          <article class="px-2 py-2">
            <p class="text-5xl font-bold text-[var(--primary)] md:text-6xl">
              {{ formatCompact(stats.totalBooks) }}+
            </p>
            <p
              class="mt-3 text-[11px] font-semibold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
            >
              Đầu sách
            </p>
          </article>

          <article class="px-2 py-2">
            <p class="text-5xl font-bold text-[var(--primary)] md:text-6xl">
              {{ formatCompact(stats.totalReaders) }}+
            </p>
            <p
              class="mt-3 text-[11px] font-semibold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
            >
              Độc giả thành viên
            </p>
          </article>

          <article class="px-2 py-2">
            <p class="text-5xl font-bold text-[var(--primary)] md:text-6xl">
              {{ formatCompact(stats.totalBorrows) }}+
            </p>
            <p
              class="mt-3 text-[11px] font-semibold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
            >
              Lượt mượn thành công
            </p>
          </article>

          <article class="px-2 py-2">
            <p class="text-5xl font-bold text-[var(--primary)] md:text-6xl">
              {{ stats.yearsActive }}+
            </p>
            <p
              class="mt-3 text-[11px] font-semibold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
            >
              Năm vận hành
            </p>
          </article>
        </div>

        <div
          v-if="loading"
          class="mt-6 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-4 text-sm text-[var(--on-surface-variant)]"
        >
          Đang tải dữ liệu giới thiệu...
        </div>

        <div
          v-else-if="errorMessage"
          class="mt-6 rounded-xl border border-[rgb(254_139_112/45%)] bg-[rgb(254_139_112/20%)] p-4 text-sm text-[var(--on-error-container)]"
        >
          {{ errorMessage }}
        </div>
      </div>
    </section>

    <section class="bg-[var(--surface-container-low)] py-20">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold">Tham Gia Cùng Chúng Tôi</h2>
        <p
          class="mx-auto mt-5 max-w-3xl text-lg text-[var(--on-surface-variant)]"
        >
          Hãy trở thành một phần của cộng đồng LocLibrary để khám phá tri thức
          mới mỗi ngày.
        </p>

        <div
          class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <RouterLink
            to="/register"
            class="btn-primary rounded-xl px-8 py-3 text-sm"
          >
            Trở thành thành viên
          </RouterLink>
          <RouterLink
            to="/books"
            class="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-8 py-3 text-sm font-bold text-[var(--primary)] transition hover:border-[var(--primary)]"
          >
            Khám phá kho sách
          </RouterLink>
        </div>
      </div>
    </section>

    <AppFooter />
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import api from "../api/axios";
import AppFooter from "../components/shared/AppFooter.vue";

const loading = ref(false);
const errorMessage = ref("");
const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  totalBorrows: 0,
  yearsActive: 1,
  sinceYear: new Date().getFullYear(),
});

const coreValues = [
  {
    icon: "auto_stories",
    title: "Sự tuyển chọn",
    description:
      "Chúng tôi ưu tiên những đầu sách giá trị, để người đọc nhanh chóng tiếp cận tri thức cần thiết.",
  },
  {
    icon: "groups",
    title: "Cộng đồng độc giả",
    description:
      "Xây dựng môi trường học tập mở, nơi bạn đọc có thể kết nối và phát triển tri thức cùng nhau.",
  },
  {
    icon: "history_edu",
    title: "Bảo tồn tri thức",
    description:
      "Số hóa và quản lý dữ liệu sách có hệ thống để tri thức luôn sẵn sàng cho các thế hệ sau.",
  },
];

const formatCompact = (value) => {
  const number = Number(value || 0);

  if (number >= 1000) {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  }

  return new Intl.NumberFormat("vi-VN").format(number);
};

const fetchAboutData = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("/meta/about");
    const payload = response?.data || {};

    stats.value = {
      totalBooks: Number(payload?.stats?.totalBooks || 0),
      totalReaders: Number(payload?.stats?.totalReaders || 0),
      totalBorrows: Number(payload?.stats?.totalBorrows || 0),
      yearsActive: Math.max(1, Number(payload?.stats?.yearsActive || 1)),
      sinceYear: Number(payload?.stats?.sinceYear || new Date().getFullYear()),
    };
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      "Không thể tải dữ liệu trang giới thiệu. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAboutData();
});
</script>
