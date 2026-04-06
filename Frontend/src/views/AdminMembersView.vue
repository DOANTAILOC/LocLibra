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
        placeholder="Tìm thành viên theo tên, mã, SĐT..."
        @open-menu="mobileMenuOpen = true"
      />

      <div class="flex flex-1 overflow-hidden">
        <section class="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <AdminPageHero
            title="Quản lý Thành viên"
            description="Giám sát hoạt động độc giả và điều phối cộng đồng đọc sách."
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
                @click="fetchMembers"
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
                v-model.trim="searchText"
                type="text"
                class="w-full rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-11 pr-4 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Tên thành viên, mã độc giả hoặc điện thoại..."
              />
            </div>

            <div class="flex gap-2">
              <select
                v-model="statusFilter"
                class="cursor-pointer appearance-none rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-3 pr-8 text-xs font-bold text-[var(--on-surface-variant)]"
              >
                <option value="ALL">TRẠNG THÁI</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="TEMP_LOCKED">Tạm khóa</option>
              </select>

              <button
                type="button"
                class="rounded-lg bg-[var(--surface-container-highest)] p-2 text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
                @click="fetchMembers"
              >
                <span class="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </AdminFilterBar>

          <FeedbackAlert :message="errorMessage" type="error" />

          <AdminTableShell
            :loading="isLoading"
            :empty="!isLoading && filteredMembers.length === 0"
            :colspan="5"
            loading-text="Đang tải danh sách thành viên..."
            empty-text="Không tìm thấy thành viên phù hợp."
            :total-text="`Tổng ${filteredMembers.length} thành viên`"
            min-width-class="min-w-[880px]"
          >
            <template #head>
              <tr
                class="border-b border-[rgb(184_188_163/20%)] bg-[var(--surface-container-low)]"
              >
                <th
                  class="px-6 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Thành viên
                </th>
                <th
                  class="px-4 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  ID & Ngày tham gia
                </th>
                <th
                  class="px-4 py-4 text-center text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Thống kê mượn
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
                v-for="member in filteredMembers"
                :key="member.id"
                class="group cursor-pointer border-l-4 transition-colors"
                :class="
                  selectedMember?.id === member.id
                    ? 'border-l-[var(--primary)] bg-[rgb(83_99_79/4%)]'
                    : 'border-l-transparent hover:bg-[rgb(83_99_79/2%)]'
                "
                @click="selectedMember = member"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-container)] text-sm font-bold text-[var(--on-secondary-container)]"
                    >
                      {{ member.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-bold">{{ member.fullName }}</p>
                      <p class="text-[11px] text-[var(--on-surface-variant)]">
                        {{ member.phone }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <p class="text-xs font-semibold">#{{ member.code }}</p>
                  <p class="text-[10px] text-[var(--on-surface-variant)]">
                    {{ member.joinedAt }}
                  </p>
                </td>
                <td class="px-4 py-4 text-center">
                  <div class="inline-flex flex-col items-center">
                    <span class="text-sm font-bold text-[var(--primary)]">{{
                      member.totalBorrows
                    }}</span>
                    <span
                      class="text-[9px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
                      >Tổng lượt</span
                    >
                  </div>
                  <div class="ml-4 inline-flex flex-col items-center">
                    <span
                      class="text-sm font-bold"
                      :class="
                        member.activeBorrows > 0
                          ? 'text-[var(--error)]'
                          : 'text-[var(--on-tertiary-fixed-variant)]'
                      "
                    >
                      {{ member.activeBorrows }}
                    </span>
                    <span
                      class="text-[9px] font-bold tracking-tight text-[var(--on-surface-variant)] uppercase"
                      >Đang giữ</span
                    >
                  </div>
                </td>
                <td class="px-4 py-4 text-center">
                  <StatusChip
                    :label="member.statusLabel"
                    :custom-class="member.statusClass"
                  />
                </td>
                <td class="px-6 py-4 text-right">
                  <div
                    class="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--primary)] transition hover:bg-[rgb(83_99_79/13%)]"
                      @click.stop="selectedMember = member"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >visibility</span
                      >
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >more_vert</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </AdminTableShell>
        </section>

        <AdminDetailAside
          title="Chi tiết thành viên"
          :has-selection="!!selectedMember"
          empty-text="Chọn một thành viên ở bảng để xem thông tin chi tiết."
        >
          <div class="space-y-5">
            <div class="text-center">
              <div
                class="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--secondary-container)] text-2xl font-bold text-[var(--on-secondary-container)] ring-4 ring-[rgb(83_99_79/10%)]"
              >
                {{ selectedMember.initials }}
              </div>
              <h5 class="text-xl">{{ selectedMember.fullName }}</h5>
              <p
                class="mt-1 text-[10px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase"
              >
                {{ selectedMember.statusLabel }}
              </p>
            </div>

            <div>
              <div
                class="mb-2 flex justify-between text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                <span>Điểm uy tín</span>
                <span class="text-[var(--primary)]"
                  >{{ selectedMember.trustScore }}/1000</span
                >
              </div>
              <div
                class="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-container-highest)]"
              >
                <div
                  class="h-full rounded-full bg-[var(--primary)]"
                  :style="{ width: `${selectedMember.trustPercent}%` }"
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
                  Mượn gần nhất
                </p>
                <p class="text-xs font-bold">
                  {{ selectedMember.latestBorrowAt }}
                </p>
              </div>
              <div
                class="rounded-xl border border-[rgb(184_188_163/18%)] bg-[var(--surface-container-lowest)] p-3"
              >
                <p
                  class="mb-1 text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
                >
                  Nợ phạt
                </p>
                <p
                  class="text-xs font-bold"
                  :class="selectedMember.debt > 0 ? 'text-[var(--error)]' : ''"
                >
                  {{ selectedMember.debtLabel }}
                </p>
              </div>
            </div>

            <div class="border-t border-[rgb(184_188_163/20%)] pt-4">
              <p
                class="mb-3 text-[11px] font-bold tracking-wider text-[var(--on-surface-variant)] uppercase"
              >
                Thông tin liên hệ
              </p>
              <div class="space-y-2 text-sm">
                <p>
                  <span class="font-semibold">Mã độc giả:</span>
                  {{ selectedMember.code }}
                </p>
                <p>
                  <span class="font-semibold">Số điện thoại:</span>
                  {{ selectedMember.phone }}
                </p>
                <p>
                  <span class="font-semibold">Địa chỉ:</span>
                  {{ selectedMember.address }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-3">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)]"
              >
                <span class="material-symbols-outlined text-sm"
                  >visibility</span
                >
                Xem hồ sơ đầy đủ
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(83_99_79/25%)] py-2.5 text-xs font-bold text-[var(--primary)]"
              >
                <span class="material-symbols-outlined text-sm">mail</span>
                Gửi thông báo
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
const errorMessage = ref("");
const searchText = ref("");
const statusFilter = ref("ALL");
const members = ref([]);
const selectedMember = ref(null);

const filteredMembers = computed(() => {
  const keyword = searchText.value.toLowerCase();

  return members.value.filter((item) => {
    if (statusFilter.value !== "ALL" && item.status !== statusFilter.value) {
      return false;
    }

    if (!keyword) return true;

    return [item.fullName, item.code, item.phone, item.address]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
});

watch(filteredMembers, (rows) => {
  if (!rows.length) {
    selectedMember.value = null;
    return;
  }

  if (!selectedMember.value) {
    selectedMember.value = rows[0];
    return;
  }

  const stillExists = rows.find((item) => item.id === selectedMember.value.id);
  if (!stillExists) {
    selectedMember.value = rows[0];
  }
});

function formatDate(dateValue) {
  if (!dateValue) return "---";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "---";
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function mapMember(reader) {
  const initials = reader.HOTEN
    ? reader.HOTEN.split(" ")
        .map((part) => part[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "DG";

  const trustScore = Math.max(
    0,
    Math.min(
      1000,
      1000 -
        (reader.NO_PHAT || 0) / 100 -
        (reader.stats?.overdueBorrows || 0) * 20,
    ),
  );

  return {
    id: reader._id,
    code: reader.MADOCGIA,
    fullName: reader.HOTEN || "Chưa có tên",
    phone: reader.DIENTHOAI || "Chưa có SĐT",
    address: reader.DIACHI || "Chưa có địa chỉ",
    joinedAt: formatDate(reader.created_at),
    latestBorrowAt: formatDate(
      reader.stats?.latestBorrowAt || reader.stats?.latestRequestAt,
    ),
    totalBorrows: reader.stats?.totalBorrows || 0,
    activeBorrows: reader.stats?.activeBorrows || 0,
    debt: reader.NO_PHAT || 0,
    debtLabel:
      reader.NO_PHAT > 0
        ? `${reader.NO_PHAT.toLocaleString("vi-VN")} VND`
        : "Không có",
    status: reader.status,
    statusLabel: reader.status === "TEMP_LOCKED" ? "Tạm khóa" : "Hoạt động",
    statusClass:
      reader.status === "TEMP_LOCKED"
        ? "bg-[rgb(254_139_112/30%)] text-[var(--on-error-container)]"
        : "status-chip-active",
    initials,
    trustScore,
    trustPercent: Math.round((trustScore / 1000) * 100),
  };
}

function normalizeError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Không thể tải dữ liệu thành viên"
  );
}

async function fetchMembers() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const query = searchText.value
      ? `?q=${encodeURIComponent(searchText.value)}`
      : "";
    const response = await api.get(`/auth/readers${query}`);
    members.value = (response.data?.items || []).map(mapMember);
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchMembers);
</script>
