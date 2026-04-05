<template>
  <EntityManagerView
    title="Quản lý Tác Giả"
    description="Quản lý danh sách tác giả trong hệ thống thư viện."
    endpoint="/admin/authors"
    entity-name="tác giả"
    create-button-text="Thêm tác giả"
    search-placeholder="Tìm tác giả theo tên..."
    loading-text="Đang tải danh sách tác giả..."
    empty-text="Không tìm thấy tác giả phù hợp."
    detail-title="Chi tiết tác giả"
    detail-empty-text="Chọn một tác giả ở bảng để xem chi tiết."
    auto-code-field-key="MATG"
    auto-code-endpoint="/admin/authors/next-code"
    :columns="columns"
    :form-fields="formFields"
    :detail-fields="detailFields"
  />
</template>

<script setup>
import EntityManagerView from "../components/admin/EntityManagerView.vue";

const columns = [
  { key: "MATG", label: "Mã tác giả" },
  { key: "Hoten", label: "Tác giả" },
  { key: "QuocTich", label: "Quốc tịch" },
  { key: "TieuSu", label: "Tiểu sử" },
];

const formFields = [
  { key: "MATG", label: "Mã tác giả", placeholder: "Tự động sinh" },
  {
    key: "Hoten",
    label: "Họ tên",
    required: true,
    placeholder: "Nhập họ tên tác giả",
  },
  { key: "QuocTich", label: "Quốc tịch", placeholder: "VD: Việt Nam" },
  {
    key: "TieuSu",
    label: "Tiểu sử",
    type: "textarea",
    placeholder: "Thông tin giới thiệu",
  },
];

const detailFields = [
  { key: "MATG", label: "Mã tác giả" },
  { key: "Hoten", label: "Họ tên" },
  { key: "QuocTich", label: "Quốc tịch" },
  { key: "TieuSu", label: "Tiểu sử" },
];
</script>
