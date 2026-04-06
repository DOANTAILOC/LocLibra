const mongoose = require("mongoose");

const BorrowSchema = new mongoose.Schema(
  {
    MADOCGIA: {
      type: String,
      ref: "Reader",
      required: true,
      trim: true,
    },
    MASACH: {
      type: String,
      ref: "Book",
      required: true,
      trim: true,
    },
    MSNV: {
      type: String,
      ref: "Staff",
      default: null,
      trim: true,
    },
    TRANGTHAI: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "BORROWING",
        "OVERDUE",
        "RETURNED",
        "LOST",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    NGAYYEUCAU: {
      type: Date,
      default: Date.now,
    },
    NGAYDUYET: {
      type: Date,
      default: null,
    },
    NGAYHENLAY: {
      type: Date,
      default: null,
    },
    NGAYMUON: {
      type: Date,
      default: null,
    },
    NGAYNHAN: {
      type: Date,
      default: null,
    },
    NGAYHENTRA: {
      type: Date,
      default: null,
    },
    NGAYTRA: {
      type: Date,
      default: null,
    },
    SO_LAN_GIA_HAN: {
      type: Number,
      min: 0,
      default: 0,
    },
    NGAYGIAHAN_CUOI: {
      type: Date,
      default: null,
    },
    TRANGTHAI_GIA_HAN: {
      type: String,
      enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
      default: "NONE",
    },
    NGAYYEUCAU_GIA_HAN: {
      type: Date,
      default: null,
    },
    NGAYDUYET_GIA_HAN: {
      type: Date,
      default: null,
    },
    LYDO_TUCHOI_GIA_HAN: {
      type: String,
      trim: true,
      default: null,
    },
    LYDOTUCHOI: {
      type: String,
      trim: true,
      default: null,
    },
    SONGAYTRE: {
      type: Number,
      min: 0,
      default: 0,
    },
    TIENPHAT: {
      type: Number,
      min: 0,
      default: 0,
    },
    TRANGTHAI_PHAT: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "PAID",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
BorrowSchema.index({ MADOCGIA: 1 });
BorrowSchema.index({ MASACH: 1 });
BorrowSchema.index({ TRANGTHAI: 1 });
BorrowSchema.index({ NGAYMUON: -1 });
BorrowSchema.index({ NGAYTRA: 1 });
BorrowSchema.index({ NGAYYEUCAU: -1 });
BorrowSchema.index({ NGAYHENTRA: 1 });

// Tìm sách đang được mượn (bao gồm quá hạn)
BorrowSchema.statics.findDangMuon = function () {
  return this.find({ TRANGTHAI: { $in: ["BORROWING", "OVERDUE"] } });
};

// Tìm lịch sử mượn của một độc giả
BorrowSchema.statics.findByDocGia = function (madocgia) {
  return this.find({ MADOCGIA: madocgia }).sort({ NGAYYEUCAU: -1 });
};

// Trả sách: cập nhật trạng thái và ngày trả
BorrowSchema.methods.traSach = function () {
  this.TRANGTHAI = "RETURNED";
  this.NGAYTRA = new Date();
  return this.save();
};

module.exports = mongoose.model("Borrow", BorrowSchema);
