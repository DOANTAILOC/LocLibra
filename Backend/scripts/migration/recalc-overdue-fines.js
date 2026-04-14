const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Borrow = require("../../src/models/Borrow");

const DAILY_FINE_RATE = 2000;

async function recalcOverdueFines() {
  const now = new Date();

  const rows = await Borrow.find({
    TRANGTHAI: "OVERDUE",
    NGAYHENTRA: { $lt: now },
  })
    .select("_id NGAYHENTRA SONGAYTRE TIENPHAT TRANGTHAI_PHAT")
    .lean();

  const ops = rows.reduce((acc, row) => {
    const dueDate = new Date(row.NGAYHENTRA);
    const overdueDays = Math.max(
      1,
      Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const fineAmount = overdueDays * DAILY_FINE_RATE;
    const fineStatus = fineAmount > 0 ? "UNPAID" : "PAID";

    const shouldUpdate =
      Number(row.SONGAYTRE || 0) !== overdueDays ||
      Number(row.TIENPHAT || 0) !== fineAmount ||
      String(row.TRANGTHAI_PHAT || "") !== fineStatus;

    if (!shouldUpdate) return acc;

    acc.push({
      updateOne: {
        filter: { _id: row._id },
        update: {
          $set: {
            SONGAYTRE: overdueDays,
            TIENPHAT: fineAmount,
            TRANGTHAI_PHAT: fineStatus,
          },
        },
      },
    });

    return acc;
  }, []);

  if (!ops.length) {
    return {
      totalOverdueRows: rows.length,
      updatedRows: 0,
    };
  }

  await Borrow.bulkWrite(ops);

  return {
    totalOverdueRows: rows.length,
    updatedRows: ops.length,
  };
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const result = await recalcOverdueFines();
    console.log("[recalc-overdue-fines] Done", result);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("[recalc-overdue-fines] Failed:", error.message);
  process.exitCode = 1;
});
