const mongoose = require("mongoose");

const readerSchema = new mongoose.Schema(
  {
    MADOCGIA: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    HOLOT: {
      type: String,
      required: true,
      trim: true,
    },
    TEN: {
      type: String,
      required: true,
      trim: true,
    },
    NGAYSINH: {
      type: Date,
    },
    PHAI: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
    },
    DIACHI: {
      type: String,
      trim: true,
    },
    DIENTHOAI: {
      type: String,
      trim: true,
    },
    AVATAR_URL: {
      type: String,
      trim: true,
      default: "",
    },
    AVATAR_PUBLIC_ID: {
      type: String,
      trim: true,
      default: "",
    },
    NO_PHAT: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
readerSchema.index({ HOLOT: "text", TEN: "text" });

module.exports = mongoose.model("Reader", readerSchema);
