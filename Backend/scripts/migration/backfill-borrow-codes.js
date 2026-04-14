const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Borrow = require("../../src/models/Borrow");

const CODE_PREFIX = "PM";
const CODE_WIDTH = 6;

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const isBorrowCode = (value) => /^PM\d+$/i.test(normalizeCode(value));

const parseBorrowCodeOrder = (code) => {
  const normalized = normalizeCode(code);
  if (!isBorrowCode(normalized)) return null;

  const order = Number.parseInt(normalized.slice(CODE_PREFIX.length), 10);
  return Number.isNaN(order) ? null : order;
};

const formatBorrowCode = (order) =>
  `${CODE_PREFIX}${String(order).padStart(CODE_WIDTH, "0")}`;

async function backfillBorrowCodes() {
  const allBorrows = await Borrow.find({})
    .select("_id MAPHIEU created_at NGAYYEUCAU")
    .sort({ created_at: 1, NGAYYEUCAU: 1, _id: 1 })
    .lean();

  const usedCodes = new Set();
  let maxOrder = 0;

  for (const borrow of allBorrows) {
    const code = normalizeCode(borrow.MAPHIEU);
    if (!isBorrowCode(code)) continue;

    usedCodes.add(code);
    const order = parseBorrowCodeOrder(code);
    if (order !== null) {
      maxOrder = Math.max(maxOrder, order);
    }
  }

  let updatedCount = 0;

  for (const borrow of allBorrows) {
    const currentCode = normalizeCode(borrow.MAPHIEU);

    if (isBorrowCode(currentCode) && !usedCodes.has(currentCode)) {
      usedCodes.add(currentCode);
      continue;
    }

    if (isBorrowCode(currentCode) && usedCodes.has(currentCode)) {
      const duplicates = allBorrows.filter(
        (item) => normalizeCode(item.MAPHIEU) === currentCode,
      );
      if (duplicates[0]?._id?.toString() === borrow._id.toString()) {
        continue;
      }
    }

    let candidateOrder = maxOrder + 1;
    let candidateCode = formatBorrowCode(candidateOrder);

    while (usedCodes.has(candidateCode)) {
      candidateOrder += 1;
      candidateCode = formatBorrowCode(candidateOrder);
    }

    await Borrow.updateOne(
      { _id: borrow._id },
      {
        $set: {
          MAPHIEU: candidateCode,
        },
      },
    );

    usedCodes.add(candidateCode);
    maxOrder = candidateOrder;
    updatedCount += 1;
  }

  return {
    total: allBorrows.length,
    updatedCount,
  };
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("Thiếu biến môi trường MONGO_URI");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const result = await backfillBorrowCodes();
    console.log("[backfill-borrow-codes] Done", result);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("[backfill-borrow-codes] Failed:", error.message);
  process.exitCode = 1;
});
