const mongoose = require("mongoose");

const PublisherSchema = new mongoose.Schema(
  {
    MANXB: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TENNXB: {
      type: String,
      required: true,
      trim: true,
    },
    DIACHI: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Indexes
PublisherSchema.index({ TENNXB: "text" });

module.exports = mongoose.model("Publisher", PublisherSchema);
