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
      <AdminTopHeader @open-menu="mobileMenuOpen = true" />

      <div class="flex flex-1">
        <section class="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <AdminPageHero :title="title" :description="description">
            <template #actions>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading"
                @click="fetchEntities"
              >
                <span class="material-symbols-outlined text-[18px]"
                  >refresh</span
                >
                Làm mới
              </button>
              <button
                v-if="canManage"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)]"
                @click="openCreateModal"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
                {{ createButtonText }}
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
                :placeholder="searchPlaceholder"
              />
            </div>
          </AdminFilterBar>

          <FeedbackAlert :message="errorMessage" type="error" />
          <FeedbackAlert :message="successMessage" type="success" />

          <AdminTableShell
            :loading="isLoading"
            :empty="!isLoading && filteredEntities.length === 0"
            :colspan="canManage ? columns.length + 1 : columns.length"
            :loading-text="loadingText"
            :empty-text="emptyText"
            :total-text="`Tổng ${filteredEntities.length} bản ghi`"
            min-width-class="min-w-[900px]"
          >
            <template #head>
              <tr
                class="border-b border-[rgb(184_188_163/20%)] bg-[var(--surface-container-low)]"
              >
                <th
                  v-for="column in columns"
                  :key="column.key"
                  class="px-4 py-4 text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  {{ column.label }}
                </th>
                <th
                  v-if="canManage"
                  class="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Hành động
                </th>
              </tr>
            </template>

            <template #rows>
              <tr
                v-for="item in paginatedEntities"
                :key="item._id"
                class="group cursor-pointer border-l-4 transition-colors"
                :class="
                  selectedEntity?._id === item._id
                    ? 'border-l-[var(--primary)] bg-[rgb(83_99_79/4%)]'
                    : 'border-l-transparent hover:bg-[rgb(83_99_79/2%)]'
                "
                @click="selectedEntity = item"
              >
                <td
                  v-for="column in columns"
                  :key="`${item._id}-${column.key}`"
                  class="px-4 py-4 text-sm"
                >
                  <div
                    v-if="
                      isImageField(column) &&
                      resolveImageValue(item, column.key)
                    "
                    class="mx-auto h-11 w-11 overflow-hidden rounded-full border border-[rgb(184_188_163/35%)]"
                  >
                    <img
                      :src="resolveImageValue(item, column.key)"
                      :alt="column.imageAlt || column.label"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <span v-else>
                    {{ item[column.key] || "---" }}
                  </span>
                </td>
                <td v-if="canManage" class="px-6 py-4 text-right">
                  <div
                    class="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--primary)] transition hover:bg-[rgb(83_99_79/13%)]"
                      @click.stop="openEditModal(item)"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >edit</span
                      >
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
                      :disabled="isDeletingId === item._id"
                      @click.stop="handleDelete(item)"
                    >
                      <span class="material-symbols-outlined text-[18px]"
                        >delete</span
                      >
                    </button>
                  </div>
                </td>
              </tr>
            </template>
            <template #footer>
              <PaginationBar
                :range-label="rangeLabel"
                :current-page="currentPage"
                :total-pages="totalPages"
                :scroll-to-top-on-change="true"
                :scroll-top-offset="0"
                @update:current-page="goToPage"
              />
            </template>
          </AdminTableShell>
        </section>

        <AdminDetailAside
          :title="detailTitle"
          :has-selection="!!selectedEntity"
          :empty-text="detailEmptyText"
        >
          <div class="space-y-4">
            <div
              v-for="field in detailFields"
              :key="field.key"
              class="rounded-xl border border-[rgb(184_188_163/18%)] bg-[var(--surface-container-lowest)] p-3"
            >
              <p
                class="mb-1 text-[10px] font-bold text-[var(--on-surface-variant)] uppercase"
              >
                {{ field.label }}
              </p>
              <p class="text-xs font-bold">
                <img
                  v-if="
                    isImageField(field) &&
                    resolveImageValue(selectedEntity, field.key)
                  "
                  :src="resolveImageValue(selectedEntity, field.key)"
                  :alt="field.imageAlt || field.label"
                  class="h-24 w-24 rounded-full border border-[rgb(184_188_163/35%)] object-cover"
                />
                <span v-else>
                  {{ selectedEntity[field.key] || "---" }}
                </span>
              </p>
            </div>

            <div class="flex flex-col gap-2 pt-2">
              <button
                v-if="canManage"
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)]"
                @click="openEditModal(selectedEntity)"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Chỉnh sửa
              </button>
              <button
                v-if="canManage"
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(83_99_79/25%)] py-2.5 text-xs font-bold text-[var(--primary)]"
                :disabled="isDeletingId === selectedEntity?._id"
                @click="handleDelete(selectedEntity)"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
                Xóa
              </button>
            </div>
          </div>
        </AdminDetailAside>
      </div>
    </main>

    <div
      v-if="showModal && canManage"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
    >
      <div
        class="w-full rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-2xl"
        :class="[modalMaxWidthClass, 'max-h-[88vh] overflow-y-auto']"
      >
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-2xl">
            {{
              mode === "edit" ? `Chỉnh sửa ${entityName}` : `Thêm ${entityName}`
            }}
          </h3>
          <button
            type="button"
            class="rounded-lg p-1.5 transition hover:bg-[var(--surface-container-highest)]"
            @click="closeModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          :class="['grid gap-4', formGridClass]"
          @submit.prevent="handleSubmit"
        >
          <div
            v-for="field in formFields"
            :key="field.key"
            :class="['space-y-1', field.fullWidth ? 'md:col-span-2' : '']"
          >
            <label class="form-label">{{ field.label }}</label>
            <input
              v-if="isAutoCodeField(field)"
              :value="autoCodePreview || 'Đang tạo mã...'"
              class="form-input"
              type="text"
              readonly
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model.trim="formData[field.key]"
              :class="['form-input', field.textareaClass || 'min-h-[90px]']"
              :required="isFieldRequired(field)"
              :placeholder="field.placeholder || ''"
            ></textarea>
            <div v-else-if="isImageField(field)" class="space-y-2">
              <div
                v-if="getImagePreview(field.key)"
                class="inline-flex h-24 w-24 overflow-hidden rounded-full border border-[rgb(184_188_163/35%)] bg-[var(--surface-container-low)]"
              >
                <img
                  :src="getImagePreview(field.key)"
                  :alt="field.imageAlt || field.label"
                  class="h-full w-full object-cover"
                />
              </div>
              <input
                type="file"
                class="form-input"
                accept="image/*"
                :required="
                  isFieldRequired(field) && !getImagePreview(field.key)
                "
                @change="onImageSelected(field, $event)"
              />
            </div>
            <input
              v-else
              v-model.trim="formData[field.key]"
              class="form-input"
              :type="field.type || 'text'"
              :required="isFieldRequired(field)"
              :placeholder="field.placeholder || ''"
            />
          </div>

          <div class="mt-2 flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              class="btn-secondary px-4 py-2 text-sm"
              @click="closeModal"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSaving"
            >
              {{
                isSaving
                  ? "Đang lưu..."
                  : mode === "edit"
                    ? "Cập nhật"
                    : "Tạo mới"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCropperModal" class="fixed inset-0 z-[90] bg-[#070a12]/95">
      <div class="mx-auto flex h-full w-full max-w-[520px] flex-col px-4 py-6">
        <div class="mb-4 flex items-center justify-between text-white">
          <h3 class="text-lg font-semibold tracking-tight">Cắt ảnh avatar</h3>
        </div>

        <div class="flex flex-1 items-center justify-center">
          <div
            class="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0b1020]"
          >
            <img
              ref="cropperImageRef"
              :src="selectedImageSrc"
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
            @click="applyCroppedImage"
          >
            Dùng ảnh này
          </button>
        </div>
      </div>
    </div>
  </div>
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
import api from "../../api/axios";
import AdminSidebar from "./AdminSidebar.vue";
import AdminDetailAside from "./shared/AdminDetailAside.vue";
import AdminFilterBar from "./shared/AdminFilterBar.vue";
import AdminPageHero from "./shared/AdminPageHero.vue";
import AdminTableShell from "./shared/AdminTableShell.vue";
import AdminTopHeader from "./shared/AdminTopHeader.vue";
import FeedbackAlert from "./shared/FeedbackAlert.vue";
import PaginationBar from "../shared/PaginationBar.vue";

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  endpoint: { type: String, required: true },
  entityName: { type: String, required: true },
  createButtonText: { type: String, default: "Thêm mới" },
  searchPlaceholder: { type: String, default: "Tìm kiếm..." },
  loadingText: { type: String, default: "Đang tải dữ liệu..." },
  emptyText: { type: String, default: "Không có dữ liệu" },
  detailTitle: { type: String, default: "Chi tiết" },
  detailEmptyText: {
    type: String,
    default: "Chọn một bản ghi để xem chi tiết.",
  },
  columns: { type: Array, required: true },
  formFields: { type: Array, required: true },
  detailFields: { type: Array, default: () => [] },
  autoCodeFieldKey: { type: String, default: "" },
  autoCodeEndpoint: { type: String, default: "" },
  canManage: { type: Boolean, default: true },
  modalMaxWidthClass: { type: String, default: "max-w-xl" },
  formGridClass: { type: String, default: "grid-cols-1" },
});

const canManage = computed(() => props.canManage !== false);

const mobileMenuOpen = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const isDeletingId = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const searchText = ref("");
const entities = ref([]);
const selectedEntity = ref(null);
const pageSize = 15;
const currentPage = ref(1);
const showModal = ref(false);
const mode = ref("create");
const formData = ref({});
const formFiles = ref({});
const imagePreviews = ref({});
const autoCodePreview = ref("");
const showCropperModal = ref(false);
const cropperImageRef = ref(null);
const selectedImageSrc = ref("");
const selectedCropFieldKey = ref("");
let cropperInstance = null;

const resolvedDetailFields = computed(() => {
  if (props.detailFields.length > 0) return props.detailFields;
  return props.formFields;
});

const filteredEntities = computed(() => {
  const keyword = searchText.value.toLowerCase();
  if (!keyword) return entities.value;

  return entities.value.filter((item) => {
    return props.columns
      .filter((column) => !isImageField(column))
      .map((column) => String(item[column.key] || ""))
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEntities.value.length / pageSize)),
);

const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredEntities.value.slice(start, start + pageSize);
});

const rangeLabel = computed(() => {
  const total = filteredEntities.value.length;
  if (!total) return "0 - 0 trên 0 bản ghi";
  const start = (currentPage.value - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  return `${start} - ${end} trên ${total} bản ghi`;
});

watch(filteredEntities, (rows) => {
  const maxPage = Math.max(1, Math.ceil(rows.length / pageSize));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }

  if (!rows.length) {
    selectedEntity.value = null;
    return;
  }

  if (!selectedEntity.value) {
    selectedEntity.value = rows[0];
    return;
  }

  const stillExists = rows.find(
    (item) => item._id === selectedEntity.value._id,
  );
  if (!stillExists) {
    selectedEntity.value = rows[0];
  }
});

watch(searchText, () => {
  currentPage.value = 1;
});

const goToPage = (page) => {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber)) return;
  if (pageNumber < 1 || pageNumber > totalPages.value) return;
  currentPage.value = pageNumber;
};

const resetFormData = () => {
  const payload = {};
  props.formFields.forEach((field) => {
    payload[field.key] = "";
  });
  formData.value = payload;
  formFiles.value = {};
  imagePreviews.value = {};
};

const isImageField = (field) => {
  return field?.type === "image";
};

const resolveImageValue = (item, key) => {
  return String(item?.[key] || "").trim();
};

const getImagePreview = (key) => {
  return String(imagePreviews.value[key] || "").trim();
};

const revokeObjectPreview = (key) => {
  const preview = imagePreviews.value[key];
  if (typeof preview === "string" && preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
};

const clearImagePreviews = () => {
  Object.keys(imagePreviews.value).forEach((key) => {
    revokeObjectPreview(key);
  });
};

const destroyCropper = () => {
  if (!cropperInstance) return;
  cropperInstance.destroy();
  cropperInstance = null;
};

const initCropper = () => {
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
};

const closeCropperModal = () => {
  showCropperModal.value = false;
  destroyCropper();

  if (selectedImageSrc.value?.startsWith("blob:")) {
    URL.revokeObjectURL(selectedImageSrc.value);
  }

  selectedImageSrc.value = "";
  selectedCropFieldKey.value = "";
};

const applyCroppedImage = async () => {
  if (!cropperInstance || !selectedCropFieldKey.value) return;

  const canvas = cropperInstance.getCroppedCanvas({
    width: 600,
    height: 600,
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

  const key = selectedCropFieldKey.value;
  const croppedFile = new File([blob], `avatar-${Date.now()}.png`, {
    type: "image/png",
  });

  revokeObjectPreview(key);
  formFiles.value[key] = croppedFile;
  imagePreviews.value[key] = URL.createObjectURL(blob);
  closeCropperModal();
};

const onImageSelected = (field, event) => {
  const file = event?.target?.files?.[0];
  if (!file) return;

  if (!String(file.type || "").startsWith("image/")) {
    errorMessage.value = "Vui lòng chọn tệp ảnh hợp lệ";
    return;
  }

  const key = field.key;
  if (selectedImageSrc.value?.startsWith("blob:")) {
    URL.revokeObjectURL(selectedImageSrc.value);
  }

  selectedCropFieldKey.value = key;
  selectedImageSrc.value = URL.createObjectURL(file);
  showCropperModal.value = true;
};

const normalizeError = (error) => {
  const serverMessage = error?.response?.data?.message;
  const serverDetail = error?.response?.data?.error;
  return (
    (serverMessage && serverDetail
      ? `${serverMessage}: ${serverDetail}`
      : serverMessage) ||
    error?.message ||
    "Không thể xử lý yêu cầu"
  );
};

const isAutoCodeField = (field) => {
  return (
    mode.value === "create" &&
    props.autoCodeFieldKey &&
    field.key === props.autoCodeFieldKey
  );
};

const isFieldRequired = (field) => {
  if (mode.value === "create") {
    if (typeof field.requiredOnCreate === "boolean") {
      return field.requiredOnCreate;
    }
  }

  if (mode.value === "edit") {
    if (typeof field.requiredOnEdit === "boolean") {
      return field.requiredOnEdit;
    }
  }

  return Boolean(field.required);
};

const fetchAutoCodePreview = async () => {
  if (!props.autoCodeEndpoint) return;

  try {
    const response = await api.get(props.autoCodeEndpoint);
    autoCodePreview.value = response.data?.nextCode || "";
    if (props.autoCodeFieldKey) {
      formData.value[props.autoCodeFieldKey] = autoCodePreview.value;
    }
  } catch (error) {
    autoCodePreview.value = "";
    errorMessage.value = normalizeError(error);
  }
};

const fetchEntities = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const query = searchText.value
      ? `?q=${encodeURIComponent(searchText.value)}`
      : "";
    const response = await api.get(`${props.endpoint}${query}`);
    entities.value = response.data?.items || [];
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = async () => {
  mode.value = "create";
  resetFormData();
  await fetchAutoCodePreview();
  showModal.value = true;
  errorMessage.value = "";
};

const openEditModal = (item) => {
  if (!item) return;

  mode.value = "edit";
  formData.value = {};
  formFiles.value = {};
  imagePreviews.value = {};
  props.formFields.forEach((field) => {
    formData.value[field.key] = item[field.key] || "";
    if (isImageField(field) && item[field.key]) {
      imagePreviews.value[field.key] = String(item[field.key]);
    }
  });
  selectedEntity.value = item;
  showModal.value = true;
  errorMessage.value = "";
};

const closeModal = () => {
  closeCropperModal();
  clearImagePreviews();
  showModal.value = false;
  resetFormData();
};

const handleSubmit = async () => {
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload = { ...formData.value };
    const imageFields = props.formFields.filter((field) => isImageField(field));
    imageFields.forEach((field) => {
      delete payload[field.key];
    });

    if (props.autoCodeFieldKey) {
      delete payload[props.autoCodeFieldKey];
    }

    const hasImageFile = imageFields.some(
      (field) => formFiles.value[field.key],
    );

    const requestBody = hasImageFile
      ? (() => {
          const formPayload = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            formPayload.append(key, value == null ? "" : String(value));
          });
          imageFields.forEach((field) => {
            const file = formFiles.value[field.key];
            if (!file) return;
            formPayload.append(field.uploadKey || "avatar", file);
          });
          return formPayload;
        })()
      : payload;

    if (mode.value === "edit" && selectedEntity.value?._id) {
      await api.put(
        `${props.endpoint}/${selectedEntity.value._id}`,
        requestBody,
      );
      successMessage.value = `Cập nhật ${props.entityName} thành công`;
    } else {
      await api.post(props.endpoint, requestBody);
      successMessage.value = `Thêm ${props.entityName} thành công`;
    }

    closeModal();
    await fetchEntities();
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (item) => {
  if (!item?._id) return;

  const accepted = window.confirm(
    `Bạn chắc chắn muốn xóa ${props.entityName} này?`,
  );
  if (!accepted) return;

  isDeletingId.value = item._id;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await api.delete(`${props.endpoint}/${item._id}`);
    successMessage.value = `Xóa ${props.entityName} thành công`;
    await fetchEntities();
  } catch (error) {
    errorMessage.value = normalizeError(error);
  } finally {
    isDeletingId.value = "";
  }
};

onMounted(async () => {
  resetFormData();
  await fetchEntities();
});

onBeforeUnmount(() => {
  closeCropperModal();
  clearImagePreviews();
});

watch(showCropperModal, async (isOpen) => {
  if (!isOpen) return;

  await nextTick();
  if (cropperImageRef.value?.complete) {
    initCropper();
  }
});
</script>
