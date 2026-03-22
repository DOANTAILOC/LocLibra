const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    MSNV: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    HoTenNV: {
      type: String,
      required: true,
      trim: true,
    },
    ChucVu: {
      type: String,
      trim: true,
      // Ví dụ: "Thủ thư", "Quản lý", "Nhân viên"
    },
    DiaChi: {
      type: String,
      trim: true,
    },
    SoDienThoai: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
module.exports = mongoose.model("Staff", StaffSchema);
