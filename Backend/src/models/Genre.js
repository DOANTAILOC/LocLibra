const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
GenreSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Genre", GenreSchema);