<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-[var(--background)] px-4 py-8 md:px-6"
  >
    <section class="mx-auto w-full max-w-4xl space-y-6">
      <div class="flex items-center justify-start">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-[rgb(184_188_163/35%)] bg-[var(--surface-container-lowest)] px-4 py-2 text-xs font-bold tracking-[0.08em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)]"
          @click="goToHome"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại trang chủ
        </button>
      </div>

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
                {{ profile.HoTenNV || "Nhân viên" }}
              </p>
              <p class="truncate text-xs text-[var(--on-surface-variant)]">
                Mã nhân viên: {{ profile.MSNV || "---" }}
              </p>
              <p class="truncate text-xs text-[var(--on-surface-variant)]">
                Username: {{ authStore.user?.account?.username || "---" }}
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
              type="button"
              class="rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)]"
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
            <p class="text-sm font-semibold tracking-[0.08em] uppercase">
              Cắt ảnh avatar
            </p>
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

      <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <div v-if="!isEditingProfile" class="space-y-4">
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Họ tên
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.HoTenNV || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Số điện thoại
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.SoDienThoai || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Địa chỉ
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.DiaChi || "Chưa cập nhật" }}
              </div>
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Chức vụ
              </p>
              <div
                class="rounded-lg bg-[var(--surface-container-low)] px-3 py-2.5 text-sm text-[var(--on-surface)]"
              >
                {{ profile.ChucVu || "---" }}
              </div>
            </div>
          </div>

          <form
            v-else
            class="grid grid-cols-1 gap-4"
            @submit.prevent="saveProfile"
          >
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Họ tên
              </p>
              <input
                v-model.trim="form.HoTenNV"
                class="form-input"
                type="text"
                required
              />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Số điện thoại
              </p>
              <input
                v-model.trim="form.SoDienThoai"
                class="form-input"
                type="text"
              />
            </div>

            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Địa chỉ
              </p>
              <textarea
                v-model.trim="form.DiaChi"
                class="form-input min-h-[90px]"
              ></textarea>
            </div>

            <div class="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                class="btn-secondary px-4 py-2 text-xs"
                :disabled="isSavingProfile"
                @click="cancelEditProfile"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSavingProfile"
              >
                {{ isSavingProfile ? "Đang lưu..." : "Lưu thông tin" }}
              </button>
            </div>
          </form>
        </article>

        <article
          class="rounded-2xl border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] p-6"
        >
          <div
            class="mb-5 flex items-center justify-between border-b border-[rgb(184_188_163/20%)] pb-3"
          >
            <h2 class="text-xl font-semibold text-[var(--primary)]">
              Mật khẩu
            </h2>
            <button
              v-if="!showPasswordForm"
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-[rgb(184_188_163/45%)] bg-[var(--surface-container-low)] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[var(--primary)] uppercase transition hover:border-[var(--primary)]"
              @click="openPasswordForm"
            >
              <span class="material-symbols-outlined text-[14px]">lock</span>
              Cập nhật mật khẩu
            </button>
          </div>

          <div
            v-if="!showPasswordForm"
            class="rounded-lg bg-[var(--surface-container-low)] px-3 py-3 text-sm text-[var(--on-surface-variant)]"
          >
            Nhấn nút Cập nhật mật khẩu để đổi mật khẩu tài khoản.
          </div>

          <form
            v-else
            class="grid grid-cols-1 gap-4"
            @submit.prevent="changePassword"
          >
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Mật khẩu hiện tại
              </p>
              <input
                v-model="passwordForm.currentPassword"
                class="form-input"
                type="password"
                required
              />
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Mật khẩu mới
              </p>
              <input
                v-model="passwordForm.newPassword"
                class="form-input"
                type="password"
                minlength="3"
                required
              />
            </div>
            <div class="space-y-1.5">
              <p
                class="text-[10px] font-bold tracking-[0.1em] text-[var(--on-surface-variant)] uppercase"
              >
                Nhập lại mật khẩu mới
              </p>
              <input
                v-model="passwordForm.confirmPassword"
                class="form-input"
                type="password"
                minlength="3"
                required
              />
            </div>

            <div class="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                class="btn-secondary px-4 py-2 text-xs"
                :disabled="isChangingPassword"
                @click="cancelPasswordForm"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isChangingPassword"
              >
                {{ isChangingPassword ? "Đang cập nhật..." : "Đổi mật khẩu" }}
              </button>
            </div>
          </form>
        </article>
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
} from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const profile = ref(authStore.user?.profile || {});
const form = ref({
  HoTenNV: "",
  SoDienThoai: "",
  DiaChi: "",
});
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const avatarInputRef = ref(null);
const avatarFile = ref(null);
const avatarPreview = ref("");
const isUploadingAvatar = ref(false);
const isSavingProfile = ref(false);
const isChangingPassword = ref(false);
const isEditingProfile = ref(false);
const showPasswordForm = ref(false);
const showCropperModal = ref(false);
const cropperImageRef = ref(null);
const selectedAvatarSrc = ref("");
let cropperInstance = null;

const errorMessage = ref("");
const successMessage = ref("");

const avatarUrl = computed(() =>
  String(profile.value?.AVATAR_URL || "").trim(),
);
const avatarText = computed(() => {
  const source = String(profile.value?.HoTenNV || "NV").trim();
  return source ? source.slice(0, 2).toUpperCase() : "NV";
});

function goToHome() {
  router.push("/");
}

function syncForm() {
  form.value = {
    HoTenNV: String(profile.value?.HoTenNV || ""),
    SoDienThoai: String(profile.value?.SoDienThoai || ""),
    DiaChi: String(profile.value?.DiaChi || ""),
  };
}

function clearAvatarPreview() {
  if (avatarPreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreview.value);
  }
  avatarPreview.value = "";
}

function openAvatarPicker() {
  if (avatarInputRef.value) {
    avatarInputRef.value.value = "";
    avatarInputRef.value.click();
  }
}

function startEditProfile() {
  syncForm();
  isEditingProfile.value = true;
  errorMessage.value = "";
  successMessage.value = "";
}

function cancelEditProfile() {
  isEditingProfile.value = false;
  syncForm();
}

function openPasswordForm() {
  showPasswordForm.value = true;
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  errorMessage.value = "";
  successMessage.value = "";
}

function cancelPasswordForm() {
  showPasswordForm.value = false;
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
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

    const { data } = await api.post("/auth/my-staff-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    profile.value = data.profile || profile.value;
    authStore.setProfile(profile.value);
    avatarFile.value = null;
    clearAvatarPreview();
    successMessage.value = data?.message || "Cập nhật avatar thành công";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Không thể cập nhật avatar";
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function saveProfile() {
  isSavingProfile.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { data } = await api.patch("/auth/my-staff-profile", {
      HoTenNV: form.value.HoTenNV,
      SoDienThoai: form.value.SoDienThoai,
      DiaChi: form.value.DiaChi,
    });

    profile.value = data.profile || profile.value;
    authStore.setProfile(profile.value);
    syncForm();
    isEditingProfile.value = false;
    successMessage.value = data?.message || "Cập nhật thông tin thành công";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Không thể cập nhật thông tin";
  } finally {
    isSavingProfile.value = false;
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = "Mật khẩu nhập lại không khớp";
    successMessage.value = "";
    return;
  }

  isChangingPassword.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { data } = await api.patch("/auth/my-password", {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    showPasswordForm.value = false;
    successMessage.value = data?.message || "Đổi mật khẩu thành công";
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Không thể đổi mật khẩu";
  } finally {
    isChangingPassword.value = false;
  }
}

watch(showCropperModal, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();

  if (cropperImageRef.value?.complete) {
    initCropper();
  }
});

onMounted(() => {
  profile.value = authStore.user?.profile || {};
  syncForm();
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
