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
      required: true,
      trim: true,
    },
    NGAYMUON: {
      type: Date,
      required: true,
      default: Date.now,
    },
    NGAYTRA: {
      type: Date,
      default: null,   // null = chưa trả
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
BorrowSchema.index({ MADOCGIA: 1 });
BorrowSchema.index({ MASACH: 1 });
BorrowSchema.index({ NGAYMUON: -1 });
BorrowSchema.index({ NGAYTRA: 1 });

// Tìm sách đang được mượn (chưa trả)
BorrowSchema.statics.findDangMuon = function () {
  return this.find({ NGAYTRA: null });
};

// Tìm lịch sử mượn của một độc giả
BorrowSchema.statics.findByDocGia = function (madocgia) {
  return this.find({ MADOCGIA: madocgia }).sort({ NGAYMUON: -1 });
};

// Trả sách: cập nhật NGAYTRA
BorrowSchema.methods.traSach = function () {
  this.NGAYTRA = new Date();
  return this.save();
};

module.exports = mongoose.model("Borrow", BorrowSchema);