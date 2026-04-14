const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Borrow = require("../../src/models/Borrow");
const Book = require("../../src/models/Book");
const Reader = require("../../src/models/Reader");
const Staff = require("../../src/models/Staff");

const DAILY_FINE_RATE = 2000;
const BORROW_CODE_PREFIX = "PM";
const BORROW_CODE_WIDTH = 6;
const DEFAULT_COUNT = 5;

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const parseCountArg = () => {
  const arg = process.argv.find((item) => item.startsWith("--count="));
  if (!arg) return DEFAULT_COUNT;

  const value = Number.parseInt(arg.split("=")[1], 10);
  if (!Number.isInteger(value) || value <= 0) return DEFAULT_COUNT;
  return value;
};

const generateNextBorrowCode = async () => {
  const existing = await Borrow.find({
    MAPHIEU: { $regex: `^${BORROW_CODE_PREFIX}\\d+$` },
  })
    .select("MAPHIEU")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const currentCode = normalizeCode(item?.MAPHIEU);
    if (!currentCode.startsWith(BORROW_CODE_PREFIX)) return max;

    const order = Number.parseInt(
      currentCode.slice(BORROW_CODE_PREFIX.length),
      10,
    );
    if (Number.isNaN(order)) return max;

    return Math.max(max, order);
  }, 0);

  return `${BORROW_CODE_PREFIX}${String(maxOrder + 1).padStart(BORROW_CODE_WIDTH, "0")}`;
};

async function pickBorrowSeeds(limit) {
  const [readers, books, staffs] = await Promise.all([
    Reader.find({}).select("MADOCGIA").lean(),
    Book.find({ TRANGTHAI: { $ne: "DELETED" }, SOQUYEN: { $gt: 0 } })
      .select("MASACH SOQUYEN")
      .lean(),
    Staff.find({}).select("MSNV").lean(),
  ]);

  if (!readers.length) {
    throw new Error("No reader found. Please create reader data first.");
  }

  if (!books.length) {
    throw new Error("No available book found with SOQUYEN > 0.");
  }

  const activeBorrows = await Borrow.find({
    TRANGTHAI: { $in: ["PENDING", "APPROVED", "BORROWING", "OVERDUE"] },
  })
    .select("MADOCGIA MASACH")
    .lean();

  const activePairSet = new Set(
    activeBorrows.map((item) => `${item.MADOCGIA}::${item.MASACH}`),
  );

  const stockMap = new Map(
    books.map((book) => [
      normalizeCode(book.MASACH),
      Number(book.SOQUYEN || 0),
    ]),
  );

  const selected = [];
  let pointer = 0;

  while (selected.length < limit && pointer < readers.length * books.length) {
    const reader = readers[pointer % readers.length];
    const book = books[Math.floor(pointer / readers.length) % books.length];
    pointer += 1;

    const madocgia = normalizeCode(reader?.MADOCGIA);
    const masach = normalizeCode(book?.MASACH);
    if (!madocgia || !masach) continue;

    const pairKey = `${madocgia}::${masach}`;
    const remain = Number(stockMap.get(masach) || 0);

    if (activePairSet.has(pairKey)) continue;
    if (remain <= 0) continue;

    selected.push({
      MADOCGIA: madocgia,
      MASACH: masach,
      MSNV: staffs[0]?.MSNV || null,
    });

    activePairSet.add(pairKey);
    stockMap.set(masach, remain - 1);
  }

  return selected;
}

async function injectOverdueBorrows(limit) {
  const seeds = await pickBorrowSeeds(limit);
  if (!seeds.length) {
    return { created: 0, message: "No eligible reader-book pairs found." };
  }

  const now = new Date();
  const createdRecords = [];
  const reduceStockByBook = new Map();

  for (const seed of seeds) {
    const requestDate = addDays(now, -20);
    const approvedDate = addDays(now, -19);
    const borrowDate = addDays(now, -18);
    const dueDate = addDays(now, -5);
    const overdueDays = Math.max(
      1,
      Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const fineAmount = overdueDays * DAILY_FINE_RATE;

    let borrow = null;

    for (let retry = 0; retry < 3; retry += 1) {
      const MAPHIEU = await generateNextBorrowCode();

      try {
        borrow = await Borrow.create({
          MAPHIEU,
          MADOCGIA: seed.MADOCGIA,
          MASACH: seed.MASACH,
          MSNV: seed.MSNV,
          TRANGTHAI: "OVERDUE",
          NGAYYEUCAU: requestDate,
          NGAYDUYET: approvedDate,
          NGAYHENLAY: addDays(approvedDate, 2),
          NGAYMUON: borrowDate,
          NGAYNHAN: borrowDate,
          NGAYHENTRA: dueDate,
          SONGAYTRE: overdueDays,
          TIENPHAT: fineAmount,
          TRANGTHAI_PHAT: fineAmount > 0 ? "UNPAID" : "PAID",
          TRANGTHAI_GIA_HAN: "NONE",
          LYDOTUCHOI: null,
          LYDO_TUCHOI_GIA_HAN: null,
        });
        break;
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MAPHIEU;

        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    if (!borrow) continue;

    createdRecords.push(borrow);
    reduceStockByBook.set(
      seed.MASACH,
      (reduceStockByBook.get(seed.MASACH) || 0) + 1,
    );
  }

  await Promise.all(
    [...reduceStockByBook.entries()].map(([MASACH, amount]) =>
      Book.updateOne(
        { MASACH, TRANGTHAI: { $ne: "DELETED" } },
        { $inc: { SOQUYEN: -amount } },
      ),
    ),
  );

  return {
    created: createdRecords.length,
    sampleCodes: createdRecords.map((item) => item.MAPHIEU).slice(0, 10),
    reducedStocks: [...reduceStockByBook.entries()],
  };
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env");
  }

  const count = parseCountArg();

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const result = await injectOverdueBorrows(count);
    console.log("[inject-overdue-borrows] Done", result);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("[inject-overdue-borrows] Failed:", error.message);
  process.exitCode = 1;
});
