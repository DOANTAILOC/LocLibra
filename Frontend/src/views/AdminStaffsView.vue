<template>
  <EntityManagerView
    title="Quản lý Nhân Viên"
    description="Quản lý thông tin nhân viên trong hệ thống thư viện."
    endpoint="/admin/staffs"
    entity-name="nhân viên"
    create-button-text="Thêm nhân viên"
    search-placeholder="Tìm theo tên, mã hoặc số điện thoại..."
    loading-text="Đang tải danh sách nhân viên..."
    empty-text="Không tìm thấy nhân viên phù hợp."
    detail-title="Chi tiết nhân viên"
    detail-empty-text="Chọn một nhân viên ở bảng để xem chi tiết."
    :columns="columns"
    :form-fields="formFields"
    :detail-fields="detailFields"
  />
</template>

<script setup>
import EntityManagerView from "../components/admin/EntityManagerView.vue";

const columns = [
  { key: "MSNV", label: "Mã NV" },
  { key: "HoTenNV", label: "Họ tên" },
  { key: "ChucVu", label: "Chức vụ" },
  { key: "SoDienThoai", label: "Điện thoại" },
];

const formFields = [
  {
    key: "MSNV",
    label: "Mã nhân viên",
    required: true,
    placeholder: "VD: NV001",
  },
  {
    key: "HoTenNV",
    label: "Họ tên",
    required: true,
    placeholder: "Nhập họ tên",
  },
  { key: "ChucVu", label: "Chức vụ", placeholder: "VD: Thủ thư" },
  {
    key: "SoDienThoai",
    label: "Số điện thoại",
    placeholder: "VD: 09xxxxxxxx",
  },
  {
    key: "DiaChi",
    label: "Địa chỉ",
    type: "textarea",
    placeholder: "Nhập địa chỉ",
  },
];

const detailFields = [
  { key: "MSNV", label: "Mã nhân viên" },
  { key: "HoTenNV", label: "Họ tên" },
  { key: "ChucVu", label: "Chức vụ" },
  { key: "SoDienThoai", label: "Số điện thoại" },
  { key: "DiaChi", label: "Địa chỉ" },
];
</script>
