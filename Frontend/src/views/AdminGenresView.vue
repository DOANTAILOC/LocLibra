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
    :columns="columns"
    :form-fields="formFields"
    :detail-fields="detailFields"
  />
</template>

<script setup>
import EntityManagerView from "../components/admin/EntityManagerView.vue";

const columns = [
  { key: "name", label: "Tên thể loại" },
  { key: "description", label: "Mô tả" },
];

const formFields = [
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
  { key: "name", label: "Tên thể loại" },
  { key: "description", label: "Mô tả" },
];
</script>
