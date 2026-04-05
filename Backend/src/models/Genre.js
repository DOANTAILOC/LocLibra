const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema(
  {
    MATL: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
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
  },
);

// Indexes
module.exports = mongoose.model("Genre", GenreSchema);
