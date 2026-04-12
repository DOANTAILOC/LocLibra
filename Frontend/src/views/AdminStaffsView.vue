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
    auto-code-field-key="MSNV"
    auto-code-endpoint="/admin/staffs/next-code"
    modal-max-width-class="max-w-3xl"
    form-grid-class="grid-cols-1 md:grid-cols-2"
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
  { key: "MSNV", label: "Mã NV" },
  { key: "HoTenNV", label: "Họ tên" },
  { key: "username", label: "Tài khoản" },
  { key: "ChucVu", label: "Chức vụ" },
  { key: "SoDienThoai", label: "Điện thoại" },
];

const formFields = [
  {
    key: "MSNV",
    label: "Mã nhân viên",
    placeholder: "Tự động sinh",
  },
  {
    key: "HoTenNV",
    label: "Họ tên",
    required: true,
    placeholder: "Nhập họ tên",
  },
  {
    key: "username",
    label: "Username đăng nhập",
    requiredOnCreate: true,
    placeholder: "Nhập username cho nhân viên",
    fullWidth: true,
  },
  {
    key: "password",
    label: "Mật khẩu đăng nhập",
    type: "password",
    requiredOnEdit: false,
    placeholder: "Để trống khi tạo sẽ dùng mặc định 123",
    fullWidth: true,
  },
  {
    key: "accountRole",
    label: "Vai trò tài khoản",
    placeholder: "staff hoặc admin (mặc định: staff)",
    fullWidth: true,
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
    fullWidth: true,
  },
];

const detailFields = [
  { key: "MSNV", label: "Mã nhân viên" },
  { key: "HoTenNV", label: "Họ tên" },
  { key: "username", label: "Username đăng nhập" },
  { key: "accountRole", label: "Vai trò tài khoản" },
  { key: "ChucVu", label: "Chức vụ" },
  { key: "SoDienThoai", label: "Số điện thoại" },
  { key: "DiaChi", label: "Địa chỉ" },
];
</script>
