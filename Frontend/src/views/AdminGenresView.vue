<template>
  <EntityManagerView
    title="Quản lý Thể Loại"
    description="Quản lý các thể loại sách phục vụ phân loại đầu sách."
    endpoint="/admin/genres"
    entity-name="thể loại"
    create-button-text="Thêm thể loại"
    search-placeholder="Tìm theo tên thể loại..."
    loading-text="Đang tải danh sách thể loại..."
    empty-text="Không tìm thấy thể loại phù hợp."
    detail-title="Chi tiết thể loại"
    detail-empty-text="Chọn một thể loại ở bảng để xem chi tiết."
    auto-code-field-key="MATL"
    auto-code-endpoint="/admin/genres/next-code"
    :columns="columns"
    :form-fields="formFields"
    :detail-fields="detailFields"
    :can-manage="authStore.isSystemAdmin"
  />
</template>

<script setup>
import EntityManagerView from "../components/admin/EntityManagerView.vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const columns = [
  { key: "MATL", label: "Mã thể loại" },
  { key: "name", label: "Tên thể loại" },
  { key: "description", label: "Mô tả" },
];

const formFields = [
  { key: "MATL", label: "Mã thể loại", placeholder: "Tự động sinh" },
  {
    key: "name",
    label: "Tên thể loại",
    required: true,
    placeholder: "VD: Khoa học",
  },
  {
    key: "description",
    label: "Mô tả",
    type: "textarea",
    placeholder: "Nhập mô tả thể loại",
  },
];

const detailFields = [
  { key: "MATL", label: "Mã thể loại" },
  { key: "name", label: "Tên thể loại" },
  { key: "description", label: "Mô tả" },
];
</script>
