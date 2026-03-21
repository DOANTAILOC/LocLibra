const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    Password: {
      type: String,
      required: true,
      select: false, // không trả về khi query mặc định
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
// Hash password trước khi lưu
StaffSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;
  this.Password = await bcrypt.hash(this.Password, 10);
});

// Kiểm tra password
StaffSchema.methods.verifyPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.Password);
};

module.exports = mongoose.model("Staff", StaffSchema);
