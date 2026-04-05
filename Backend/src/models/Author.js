const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    MATG: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    Hoten: {
      type: String,
      required: true,
      trim: true,
    },
    TieuSu: {
      type: String,
      trim: true,
    },
    QuocTich: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
authorSchema.index({ Hoten: "text" });

module.exports = mongoose.model("Author", authorSchema);
