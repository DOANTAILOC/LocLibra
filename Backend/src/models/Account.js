const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff", "reader"],
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    readerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

AccountSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

AccountSchema.methods.verifyPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

AccountSchema.index({ role: 1 });

module.exports = mongoose.model("Account", AccountSchema);
