const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    MASACH: {
      type: String,
      ref: "Book",
      required: true,
      trim: true,
      index: true,
    },
    ACCOUNT_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    DIEM: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

VoteSchema.index({ MASACH: 1, ACCOUNT_ID: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
