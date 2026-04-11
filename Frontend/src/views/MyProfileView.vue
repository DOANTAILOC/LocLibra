<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-[var(--background)] px-4 py-8 md:px-6"
  >
    <section class="mx-auto w-full max-w-5xl space-y-6">
      <section
        class="rounded-2xl border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-4">
            <div
              class="relative h-24 w-24 overflow-hidden rounded-full border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)]"
            >
              <img
                v-if="avatarPreview || avatarUrl"
                :src="avatarPreview || avatarUrl"
                alt="Avatar"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="inline-flex h-full w-full items-center justify-center bg-[var(--primary)] text-2xl font-bold uppercase text-white"
              >
                {{ avatarText }}
              </div>
            </div>

            <div class="min-w-0">
              <p class="truncate text-base font-bold text-[var(--on-surface)]">
                {{ displayName }}
              </p>
              <p class="truncate text-xs text-[var(--on-surface-variant)]">
                Mã độc giả: {{ readerCode }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              ref="avatarInputRef"
              type="file"
              class="hidden"
              accept="image/*"
              :disabled="isUploadingAvatar"
              @change="onAvatarFileChange"
            />
            <button
              v-if="avatarFile"
              type="button"
              class="rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isUploadingAvatar"
              @click="uploadAvatar"
            >
              {{ isUploadingAvatar ? "Đang tải ảnh..." : "Lưu avatar" }}
            </button>
            <button
              v-if="avatarFile"
              type="button"
              class="rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isUploadingAvatar"
              @click="openAvatarPicker"
            >
              Thay đổi
            </button>
            <button
              v-else
              type="button"
              class="rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isUploadingAvatar"
              @click="openAvatarPicker"
            >
              Chỉnh sửa avatar
            </button>
          </div>
        </div>
      </section>

      <div v-if="showCropperModal" class="fixed inset-0 z-[90] bg-[#070a12]/95">
        <div
          class="mx-auto flex h-full w-full max-w-[520px] flex-col px-4 py-6"
        >
          <div class="mb-4 flex items-center justify-between text-white">
            <!-- <button
              type="button"
              class="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10"
              @click="closeCropperModal"
            >
              Quay lại
            </button> -->
            <!-- <h3 class="text-xl font-semibold tracking-tight text-white">
              Cắt ảnh avatar
            </h3>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10"
              @click="closeCropperModal"
            >
              Đóng
            </button> -->
          </div>
          <div class="flex flex-1 items-center justify-center">
            <div
              class="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0b1020]"
            >
              <img
                ref="cropperImageRef"
                :src="selectedAvatarSrc"
                alt="Crop avatar"
                class="block max-w-full"
                @load="initCropper"
              />
            </div>
          </div>
          <div class="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              class="rounded-full border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-5 py-2 text-xs font-bold tracking-[0.08em] text-[var(--on-surface)] uppercase transition hover:border-[var(--primary)]"
              @click="closeCropperModal"
            >
              Hủy
            </button>
            <button
              type="button"
              class="rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold tracking-[0.08em] text-[var(--on-primary)] uppercase transition hover:brightness-95"
              @click="applyCropAvatar"
            >
              Dùng ảnh này
            </button>
          </div>
        </div>
      </div>

      <section
        v-if="errorMessage"
        class="rounded-xl border border-[rgb(165_71_49/30%)] bg-[rgb(254_139_112/18%)] px-4 py-3 text-sm text-[var(--on-error-container)]"
      >
        {{ errorMessage }}
      </section>
      <section
        v-if="successMessage"
        class="rounded-xl border border-[rgb(83_99_79/25%)] bg-[rgb(214_232_207/35%)] px-4 py-3 text-sm text-[var(--on-primary-container)]"
      >
        {{ successMessage }}
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article
          class="rounded-2xl border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] p-6"
        >
          <div
            class="mb-5 flex items-center justify-between border-b border-[rgb(184_188_163/20%)] pb-3"
          >
            <h2 class="text-xl font-semibold text-[var(--primary)]">
              Thông tin cá nhân
            </h2>
            <button
              v-if="!isEditingProfile"
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)]"
              @click="startEditProfile"
            >
              <span class="material-symbols-outlined text-[14px]">edit</span>
              Chỉnh sửa
            </button>
          </div>

          <div
            v-if="!isEditingProfile"
            class="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div class="space-y-1.5 md:col-span-2">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Username
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm font-medium text-[var(--on-surface)]"
              >
                {{ username }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Họ
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.HOLOT || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Tên
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.TEN || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Ngày sinh
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ birthDateText }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Giới tính
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.PHAI || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Điện thoại
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.DIENTHOAI || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Địa chỉ
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.DIACHI || "Chưa cập nhật" }}
              </div>
            </div>
          </div>

          <form
            v-else
            class="grid grid-cols-1 gap-4 md:grid-cols-2"
            @submit.prevent="saveProfile"
          >
            <div class="space-y-1.5 md:col-span-2">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Username
              </p>
              <input
                :value="username"
                class="form-input"
                type="text"
                readonly
              />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Họ
              </p>
              <input
                v-model.trim="form.HOLOT"
                class="form-input"
                type="text"
                required
              />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Tên
              </p>
              <input
                v-model.trim="form.TEN"
                class="form-input"
                type="text"
                required
              />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Ngày sinh
              </p>
              <input v-model="form.NGAYSINH" class="form-input" type="date" />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Giới tính
              </p>
              <select v-model="form.PHAI" class="form-select">
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Điện thoại
              </p>
              <input
                v-model.trim="form.DIENTHOAI"
                class="form-input"
                type="text"
              />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Địa chỉ
              </p>
              <textarea
                v-model.trim="form.DIACHI"
                class="form-input min-h-[86px]"
              ></textarea>
            </div>

            <div class="mt-2 flex items-center justify-end gap-2 md:col-span-2">
              <button
                type="button"
                class="btn-secondary px-4 py-2 text-xs"
                :disabled="isSaving"
                @click="cancelEditProfile"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSaving"
              >
                {{ isSaving ? "Đang lưu..." : "Lưu thông tin" }}
              </button>
            </div>
          </form>
        </article>

        <div class="space-y-5">
          <article
            class="rounded-2xl border p-5"
            :class="
              totalFineDebt > 0
                ? 'border-[rgb(165_71_49/22%)] bg-[rgb(254_139_112/18%)]'
                : 'border-[rgb(127_131_108/22%)] bg-[rgb(231_235_208/40%)]'
            "
          >
            <p
              class="text-[10px] font-bold tracking-[0.12em] text-[var(--on-surface-variant)] uppercase"
            >
              Nợ phạt hiện tại
            </p>
            <p
              class="mt-2 text-3xl font-bold"
              :class="
                totalFineDebt > 0
                  ? 'text-[var(--on-error-container)]'
                  : 'text-[var(--on-surface-variant)]'
              "
            >
              {{ formatCurrency(totalFineDebt) }}
            </p>
          </article>

          <article
            class="rounded-2xl border border-[rgb(184_188_163/25%)] bg-[var(--surface-container)] p-5"
          >
            <p
              class="text-[10px] font-bold tracking-[0.12em] text-[var(--on-surface-variant)] uppercase"
            >
              Thống kê mượn sách
            </p>
            <div class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span>Đang mượn</span>
                <span
                  class="rounded-full bg-[var(--primary-container)] px-2.5 py-1 text-xs font-bold text-[var(--on-primary-container)]"
                  >{{ borrowStats.borrowing }} cuốn</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span>Quá hạn</span>
                <span
                  class="rounded-full bg-[rgb(254_139_112/28%)] px-2.5 py-1 text-xs font-bold text-[var(--on-error-container)]"
                  >{{ borrowStats.overdue }} cuốn</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span>Lượt mượn năm {{ currentYear }}</span>
                <span class="font-bold text-[var(--primary)]">{{
                  borrowStats.thisYear
                }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref("");
const successMessage = ref("");
const isSaving = ref(false);
const isUploadingAvatar = ref(false);
const isEditingProfile = ref(false);
const myBorrows = ref([]);
const avatarInputRef = ref(null);
const avatarFile = ref(null);
const avatarPreview = ref("");
const showCropperModal = ref(false);
const cropperImageRef = ref(null);
const selectedAvatarSrc = ref("");
let cropperInstance = null;
const form = ref({
  HOLOT: "",
  TEN: "",
  NGAYSINH: "",
  PHAI: "",
  DIACHI: "",
  DIENTHOAI: "",
});

watchEffect(() => {
  if (!authStore.isLoggedIn) {
    router.replace("/login");
  }
});

const profile = computed(() => authStore.user?.profile || {});

const displayName = computed(() => {
  const fullName = [profile.value?.HOLOT, profile.value?.TEN]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || authStore.user?.account?.username || "Độc giả";
});

const avatarText = computed(() => {
  const source = displayName.value.trim();
  return source ? source.slice(0, 2).toUpperCase() : "DG";
});

const avatarUrl = computed(() =>
  String(profile.value?.AVATAR_URL || "").trim(),
);
const readerCode = computed(() => profile.value?.MADOCGIA || "---");
const username = computed(() => authStore.user?.account?.username || "---");
const totalFineDebt = computed(() => {
  const debtFromProfile = Number(profile.value?.NO_PHAT || 0);
  if (debtFromProfile > 0) {
    return debtFromProfile;
  }

  return myBorrows.value
    .filter((item) => item?.TRANGTHAI_PHAT === "UNPAID")
    .reduce((sum, item) => sum + Number(item?.TIENPHAT || 0), 0);
});
const currentYear = new Date().getFullYear();
const birthDateText = computed(() => {
  if (!profile.value?.NGAYSINH) return "Chưa cập nhật";
  const date = new Date(profile.value.NGAYSINH);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(date);
});

const borrowStats = computed(() => {
  const borrowing = myBorrows.value.filter(
    (item) => item.TRANGTHAI === "BORROWING",
  ).length;
  const overdue = myBorrows.value.filter(
    (item) => item.TRANGTHAI === "OVERDUE",
  ).length;
  const thisYear = myBorrows.value.filter((item) => {
    const date = new Date(item.NGAYMUON || item.NGAYYEUCAU || item.created_at);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === currentYear;
  }).length;
  return { borrowing, overdue, thisYear };
});

function formatDateForInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fillFormFromProfile() {
  form.value = {
    HOLOT: String(profile.value?.HOLOT || ""),
    TEN: String(profile.value?.TEN || ""),
    NGAYSINH: formatDateForInput(profile.value?.NGAYSINH),
    PHAI: String(profile.value?.PHAI || ""),
    DIACHI: String(profile.value?.DIACHI || ""),
    DIENTHOAI: String(profile.value?.DIENTHOAI || ""),
  };
}

function resetForm() {
  fillFormFromProfile();
  errorMessage.value = "";
  successMessage.value = "";
}

function startEditProfile() {
  fillFormFromProfile();
  isEditingProfile.value = true;
  errorMessage.value = "";
  successMessage.value = "";
}

function cancelEditProfile() {
  resetForm();
  isEditingProfile.value = false;
}

function openAvatarPicker() {
  if (avatarInputRef.value) {
    avatarInputRef.value.value = "";
    avatarInputRef.value.click();
  }
}

function clearAvatarPreview() {
  if (avatarPreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreview.value);
  }
  avatarPreview.value = "";
}

function destroyCropper() {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

function initCropper() {
  if (!showCropperModal.value || !cropperImageRef.value) return;

  destroyCropper();
  cropperInstance = new Cropper(cropperImageRef.value, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 0.9,
    dragMode: "move",
    responsive: true,
    background: false,
    guides: false,
    center: true,
    highlight: true,
    movable: true,
    zoomable: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    scalable: false,
    rotatable: false,
  });
}

function closeCropperModal() {
  showCropperModal.value = false;
  destroyCropper();
  if (selectedAvatarSrc.value?.startsWith("blob:")) {
    URL.revokeObjectURL(selectedAvatarSrc.value);
  }
  selectedAvatarSrc.value = "";
}

async function applyCropAvatar() {
  if (!cropperInstance) return;

  const canvas = cropperInstance.getCroppedCanvas({
    width: 600,
    height: 800,
    imageSmoothingQuality: "high",
  });

  if (!canvas) return;

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png", 0.95);
  });

  if (!blob) {
    errorMessage.value = "Không thể xử lý ảnh đã cắt";
    return;
  }

  avatarFile.value = new File([blob], `avatar-${Date.now()}.png`, {
    type: "image/png",
  });
  clearAvatarPreview();
  avatarPreview.value = URL.createObjectURL(blob);
  closeCropperModal();
}

function parseBorrowResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;
}

async function fetchMyBorrows() {
  try {
    const res = await api.get("/borrows/my");
    myBorrows.value = parseBorrowResponse(res.data);
  } catch {
    myBorrows.value = [];
  }
}

async function saveProfile() {
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload = {
      HOLOT: form.value.HOLOT,
      TEN: form.value.TEN,
      NGAYSINH: form.value.NGAYSINH || null,
      PHAI: form.value.PHAI || null,
      DIACHI: form.value.DIACHI,
      DIENTHOAI: form.value.DIENTHOAI,
    };

    const res = await api.patch("/auth/my-profile", payload);
    authStore.setProfile(res.data?.profile || profile.value);
    fillFormFromProfile();
    isEditingProfile.value = false;
    successMessage.value = res.data?.message || "Cập nhật thông tin thành công";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Không thể cập nhật thông tin";
  } finally {
    isSaving.value = false;
  }
}

function onAvatarFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    closeCropperModal();
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  if (selectedAvatarSrc.value?.startsWith("blob:")) {
    URL.revokeObjectURL(selectedAvatarSrc.value);
  }
  selectedAvatarSrc.value = URL.createObjectURL(file);
  showCropperModal.value = true;
}

async function uploadAvatar() {
  if (!avatarFile.value) return;

  isUploadingAvatar.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile.value);
    const res = await api.post("/auth/my-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    authStore.setProfile(res.data?.profile || profile.value);
    successMessage.value = res.data?.message || "Cập nhật avatar thành công";
    avatarFile.value = null;
    clearAvatarPreview();
    if (avatarInputRef.value) {
      avatarInputRef.value.value = "";
    }
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Không thể tải ảnh avatar";
  } finally {
    isUploadingAvatar.value = false;
  }
}

watch(showCropperModal, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();

  if (cropperImageRef.value?.complete) {
    initCropper();
  }
});

onMounted(async () => {
  await authStore.verifyAuth();
  fillFormFromProfile();
  await fetchMyBorrows();
});

onBeforeUnmount(() => {
  clearAvatarPreview();
  closeCropperModal();
});
</script>

<style scoped>
:deep(.cropper-container) {
  background: #0b1020;
}

:deep(.cropper-wrap-box),
:deep(.cropper-canvas),
:deep(.cropper-drag-box) {
  background: #0b1020;
}

:deep(.cropper-bg) {
  background-image: none;
  background-color: #0b1020;
}

:deep(.cropper-modal) {
  background-color: rgb(0 0 0 / 55%) !important;
}

:deep(.cropper-view-box) {
  outline: 3px solid rgb(255 255 255 / 96%);
  outline-offset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 52%);
}

:deep(.cropper-dashed) {
  display: none;
}

:deep(.cropper-face) {
  background-color: rgb(255 255 255 / 8%);
  border-radius: 50%;
}

:deep(.cropper-point) {
  width: 10px;
  height: 10px;
  border: 1px solid rgb(17 24 39 / 90%);
  background-color: #fff;
}
</style>
