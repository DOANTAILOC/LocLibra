const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    MASACH: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TENSACH: {
      type: String,
      required: true,
      trim: true,
    },
    DONGIA: {
      type: Number,
      required: true,
      min: 0,
    },
    SOQUYEN: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    NAMXUATBAN: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear(),
    },
    MANXB: {
      type: String,
      ref: "Publisher",
      required: true,
      trim: true,
    },
    TACGIA: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Sách phải có ít nhất một tác giả",
      },
    },
    THELOAI: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    MOTA_NGAN: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    ANHBIA_URL: {
      type: String,
      trim: true,
      default: "",
    },
    ANHBIA_PUBLIC_ID: {
      type: String,
      trim: true,
      default: "",
    },
    TRANGTHAI: {
      type: String,
      enum: ["ACTIVE", "DELETED"],
      default: "ACTIVE",
      index: true,
    },
    DA_XOA_LUC: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
BookSchema.index({ TENSACH: "text", TACGIA: "text" });
BookSchema.index({ MANXB: 1 });
BookSchema.index({ SOQUYEN: 1 });

module.exports = mongoose.model("Book", BookSchema);
