<template>
  <EntityManagerView
    title="Quản lý Nhà Xuất Bản"
    description="Quản lý thông tin nhà xuất bản trong hệ thống thư viện."
    endpoint="/admin/publishers"
    entity-name="nhà xuất bản"
    create-button-text="Thêm nhà xuất bản"
    search-placeholder="Tìm theo mã, tên hoặc địa chỉ nhà xuất bản..."
    loading-text="Đang tải danh sách nhà xuất bản..."
    empty-text="Không tìm thấy nhà xuất bản phù hợp."
    detail-title="Chi tiết nhà xuất bản"
    detail-empty-text="Chọn một nhà xuất bản ở bảng để xem chi tiết."
    :columns="columns"
    :form-fields="formFields"
    :detail-fields="detailFields"
    auto-code-field-key="MANXB"
    auto-code-endpoint="/admin/publishers/next-code"
    :can-manage="authStore.isSystemAdmin"
  />
</template>

<script setup>
import EntityManagerView from "../components/admin/EntityManagerView.vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const columns = [
  { key: "MANXB", label: "Mã NXB" },
  { key: "TENNXB", label: "Tên nhà xuất bản" },
  { key: "DIACHI", label: "Địa chỉ" },
];

const formFields = [
  {
    key: "MANXB",
    label: "Mã nhà xuất bản",
    required: true,
    placeholder: "VD: NXB001",
  },
  {
    key: "TENNXB",
    label: "Tên nhà xuất bản",
    required: true,
    placeholder: "Nhập tên nhà xuất bản",
  },
  {
    key: "DIACHI",
    label: "Địa chỉ",
    type: "textarea",
    placeholder: "Nhập địa chỉ nhà xuất bản",
  },
];

const detailFields = [
  { key: "MANXB", label: "Mã nhà xuất bản" },
  { key: "TENNXB", label: "Tên nhà xuất bản" },
  { key: "DIACHI", label: "Địa chỉ" },
];
</script>
