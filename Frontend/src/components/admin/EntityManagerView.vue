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

      <div class="flex flex-1 overflow-hidden">
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
                class="material-symbols-outlined absolute inset-y-0 left-3 flex items-center text-sm text-[var(--on-surface-variant)]"
              >
                search
              </span>
              <input
                v-model.trim="searchText"
                type="text"
                class="w-full rounded-lg border border-[rgb(184_188_163/25%)] bg-[var(--surface-container-lowest)] py-2 pl-9 pr-4 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                :placeholder="searchPlaceholder"
              />
            </div>
          </AdminFilterBar>

          <FeedbackAlert :message="errorMessage" type="error" />
          <FeedbackAlert :message="successMessage" type="success" />

          <AdminTableShell
            :loading="isLoading"
            :empty="!isLoading && filteredEntities.length === 0"
            :colspan="columns.length + 1"
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
                  class="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase"
                >
                  Hành động
                </th>
              </tr>
            </template>

            <template #rows>
              <tr
                v-for="item in filteredEntities"
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
                  {{ item[column.key] || "---" }}
                </td>
                <td class="px-6 py-4 text-right">
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
                {{ selectedEntity[field.key] || "---" }}
              </p>
            </div>

            <div class="flex flex-col gap-2 pt-2">
              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-xs font-bold text-[var(--on-primary)]"
                @click="openEditModal(selectedEntity)"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Chỉnh sửa
              </button>
              <button
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
      v-if="showModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
    >
      <div
        class="w-full max-w-xl rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-2xl"
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

        <form class="grid grid-cols-1 gap-4" @submit.prevent="handleSubmit">
          <div v-for="field in formFields" :key="field.key" class="space-y-1">
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
              class="form-input min-h-[90px]"
              :required="field.required"
              :placeholder="field.placeholder || ''"
            ></textarea>
            <input
              v-else
              v-model.trim="formData[field.key]"
              class="form-input"
              :type="field.type || 'text'"
              :required="field.required"
              :placeholder="field.placeholder || ''"
            />
          </div>

          <div class="mt-2 flex justify-end gap-2">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import api from "../../api/axios";
import AdminSidebar from "./AdminSidebar.vue";
import AdminDetailAside from "./shared/AdminDetailAside.vue";
import AdminFilterBar from "./shared/AdminFilterBar.vue";
import AdminPageHero from "./shared/AdminPageHero.vue";
import AdminTableShell from "./shared/AdminTableShell.vue";
import AdminTopHeader from "./shared/AdminTopHeader.vue";
import FeedbackAlert from "./shared/FeedbackAlert.vue";

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
});

const mobileMenuOpen = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const isDeletingId = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const searchText = ref("");
const entities = ref([]);
const selectedEntity = ref(null);
const showModal = ref(false);
const mode = ref("create");
const formData = ref({});
const autoCodePreview = ref("");

const resolvedDetailFields = computed(() => {
  if (props.detailFields.length > 0) return props.detailFields;
  return props.formFields;
});

const filteredEntities = computed(() => {
  const keyword = searchText.value.toLowerCase();
  if (!keyword) return entities.value;

  return entities.value.filter((item) => {
    return props.columns
      .map((column) => String(item[column.key] || ""))
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
});

watch(filteredEntities, (rows) => {
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

const resetFormData = () => {
  const payload = {};
  props.formFields.forEach((field) => {
    payload[field.key] = "";
  });
  formData.value = payload;
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
  props.formFields.forEach((field) => {
    formData.value[field.key] = item[field.key] || "";
  });
  selectedEntity.value = item;
  showModal.value = true;
  errorMessage.value = "";
};

const closeModal = () => {
  showModal.value = false;
  resetFormData();
};

const handleSubmit = async () => {
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload = { ...formData.value };
    if (props.autoCodeFieldKey) {
      delete payload[props.autoCodeFieldKey];
    }

    if (mode.value === "edit" && selectedEntity.value?._id) {
      await api.put(`${props.endpoint}/${selectedEntity.value._id}`, payload);
      successMessage.value = `Cập nhật ${props.entityName} thành công`;
    } else {
      await api.post(props.endpoint, payload);
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
</script>
