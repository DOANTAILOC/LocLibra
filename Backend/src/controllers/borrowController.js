const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const Reader = require("../models/Reader");
const Staff = require("../models/Staff");

const MAX_ACTIVE_BORROWS = 5;
const DEFAULT_BORROW_DAYS = 14;
const DEFAULT_PICKUP_DEADLINE_DAYS = 2;
const DEFAULT_EXTENSION_DAYS = 7;
const MAX_EXTENSION_COUNT = 1;
const DAILY_FINE_RATE = 2000;
const BORROW_CODE_PREFIX = "PM";
const BORROW_CODE_WIDTH = 6;
const BORROW_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "BORROWING",
  "OVERDUE",
  "RETURNED",
  "LOST",
  "CANCELLED",
];
const EXTENSION_REQUEST_STATUSES = ["NONE", "PENDING", "APPROVED", "REJECTED"];

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getOverdueDays = (dueDate, returnedAt) => {
  if (!dueDate || returnedAt <= dueDate) return 0;
  const diffMs = returnedAt.getTime() - dueDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.ceil(diffMs / oneDayMs);
};

const getReaderFromAccount = async (req) => {
  if (!req.account?.readerId) return null;
  return Reader.findById(req.account.readerId);
};

const getStaffFromAccount = async (req) => {
  if (!req.account?.staffId) return null;
  return Staff.findById(req.account.staffId);
};

const releaseReservedStockForBorrows = async (borrows) => {
  if (!Array.isArray(borrows) || !borrows.length) return;

  const releaseByBook = borrows.reduce((acc, item) => {
    const code = String(item?.MASACH || "").trim();
    if (!code) return acc;
    acc.set(code, (acc.get(code) || 0) + 1);
    return acc;
  }, new Map());

  if (!releaseByBook.size) return;

  await Promise.all(
    [...releaseByBook.entries()].map(([masach, amount]) =>
      Book.updateOne(
        { MASACH: masach, TRANGTHAI: { $ne: "DELETED" } },
        { $inc: { SOQUYEN: amount } },
      ),
    ),
  );
};

const cancelExpiredApprovedBorrows = async ({ madocgia } = {}) => {
  const now = new Date();
  const filter = {
    TRANGTHAI: "APPROVED",
    NGAYHENLAY: { $lt: now },
  };

  if (madocgia) {
    filter.MADOCGIA = madocgia;
  }

  const expiredBorrows = await Borrow.find(filter).select("_id MASACH").lean();
  if (!expiredBorrows.length) {
    return { cancelledCount: 0 };
  }

  const transitionedBorrows = [];

  await Promise.all(
    expiredBorrows.map(async (item) => {
      const updatedBorrow = await Borrow.findOneAndUpdate(
        {
          _id: item._id,
          TRANGTHAI: "APPROVED",
          NGAYHENLAY: { $lt: now },
        },
        {
          $set: {
            TRANGTHAI: "CANCELLED",
            LYDOTUCHOI: "Quá hạn nhận sách",
          },
        },
      );

      if (updatedBorrow) {
        transitionedBorrows.push(item);
      }
    }),
  );

  await releaseReservedStockForBorrows(transitionedBorrows);

  return { cancelledCount: transitionedBorrows.length };
};

const syncOverdueStateAndFine = async ({ madocgia } = {}) => {
  const now = new Date();
  const baseFilter = {
    NGAYHENTRA: { $lt: now },
  };

  if (madocgia) {
    baseFilter.MADOCGIA = madocgia;
  }

  const statusUpdateResult = await Borrow.updateMany(
    {
      ...baseFilter,
      TRANGTHAI: "BORROWING",
    },
    { $set: { TRANGTHAI: "OVERDUE" } },
  );

  const overdueBorrows = await Borrow.find({
    ...baseFilter,
    TRANGTHAI: "OVERDUE",
  })
    .select("_id NGAYHENTRA SONGAYTRE TIENPHAT TRANGTHAI_PHAT")
    .lean();

  const bulkOps = overdueBorrows.reduce((ops, borrow) => {
    const overdueDays = getOverdueDays(borrow?.NGAYHENTRA, now);
    const fineAmount = overdueDays * DAILY_FINE_RATE;
    const isAlreadyPaid =
      String(borrow?.TRANGTHAI_PHAT || "").toUpperCase() === "PAID";

    const nextOverdueDays = isAlreadyPaid
      ? Number(borrow?.SONGAYTRE || 0)
      : overdueDays;
    const nextFineAmount = isAlreadyPaid
      ? Number(borrow?.TIENPHAT || 0)
      : fineAmount;
    const nextFineStatus = isAlreadyPaid
      ? "PAID"
      : fineAmount > 0
        ? "UNPAID"
        : "PAID";

    const shouldUpdate =
      Number(borrow?.SONGAYTRE || 0) !== nextOverdueDays ||
      Number(borrow?.TIENPHAT || 0) !== nextFineAmount ||
      String(borrow?.TRANGTHAI_PHAT || "") !== nextFineStatus;

    if (!shouldUpdate) return ops;

    ops.push({
      updateOne: {
        filter: { _id: borrow._id },
        update: {
          $set: {
            SONGAYTRE: nextOverdueDays,
            TIENPHAT: nextFineAmount,
            TRANGTHAI_PHAT: nextFineStatus,
          },
        },
      },
    });

    return ops;
  }, []);

  if (bulkOps.length) {
    await Borrow.bulkWrite(bulkOps);
  }

  return {
    transitionedCount: Number(statusUpdateResult?.modifiedCount || 0),
    updatedFineCount: bulkOps.length,
  };
};

const syncOverdueForReader = async (madocgia) => {
  return syncOverdueStateAndFine({ madocgia });
};

const syncExpiredPickupForReader = async (madocgia) => {
  return cancelExpiredApprovedBorrows({ madocgia });
};

const syncExpiredPickup = async () => {
  return cancelExpiredApprovedBorrows();
};

const generateNextBorrowCode = async () => {
  const existing = await Borrow.find({
    MAPHIEU: { $regex: `^${BORROW_CODE_PREFIX}\\d+$` },
  })
    .select("MAPHIEU")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const currentCode = String(item?.MAPHIEU || "")
      .trim()
      .toUpperCase();
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

const createBorrowRequest = async (req, res) => {
  try {
    const { MASACH } = req.body;

    if (!MASACH) {
      return res.status(400).json({ message: "Vui lòng cung cấp MASACH" });
    }

    const reader = await getReaderFromAccount(req);
    if (!reader) {
      return res.status(403).json({ message: "Tài khoản không phải độc giả" });
    }

    if (reader.NO_PHAT > 0) {
      return res.status(400).json({
        message: "Độc giả đang còn nợ phạt, không thể tạo yêu cầu mượn mới",
        noPhat: reader.NO_PHAT,
      });
    }

    await syncOverdueForReader(reader.MADOCGIA);
    await syncExpiredPickupForReader(reader.MADOCGIA);

    const hasOverdue = await Borrow.exists({
      MADOCGIA: reader.MADOCGIA,
      TRANGTHAI: "OVERDUE",
    });
    if (hasOverdue) {
      return res.status(400).json({
        message:
          "Độc giả có sách quá hạn chưa trả, không thể tạo yêu cầu mượn mới",
      });
    }

    const activeCount = await Borrow.countDocuments({
      MADOCGIA: reader.MADOCGIA,
      TRANGTHAI: { $in: ["PENDING", "APPROVED", "BORROWING", "OVERDUE"] },
    });

    if (activeCount >= MAX_ACTIVE_BORROWS) {
      return res.status(400).json({
        message: `Đã đạt giới hạn ${MAX_ACTIVE_BORROWS} lượt mượn/yêu cầu đang hoạt động`,
      });
    }

    const book = await Book.findOne({
      MASACH,
      TRANGTHAI: { $ne: "DELETED" },
    });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    if (book.SOQUYEN <= 0) {
      return res
        .status(400)
        .json({ message: "Sách đã hết, không thể tạo yêu cầu" });
    }

    const duplicatedRequest = await Borrow.exists({
      MADOCGIA: reader.MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ["PENDING", "APPROVED", "BORROWING", "OVERDUE"] },
    });

    if (duplicatedRequest) {
      return res.status(409).json({
        message: "Bạn đã có yêu cầu/lượt mượn đang hoạt động cho sách này",
      });
    }

    let borrow = null;

    for (let retry = 0; retry < 3; retry += 1) {
      const MAPHIEU = await generateNextBorrowCode();

      try {
        borrow = await Borrow.create({
          MAPHIEU,
          MADOCGIA: reader.MADOCGIA,
          MASACH,
          TRANGTHAI: "PENDING",
          NGAYYEUCAU: new Date(),
        });
        break;
      } catch (createError) {
        const isDuplicateBorrowCode =
          createError?.code === 11000 && createError?.keyPattern?.MAPHIEU;

        if (!isDuplicateBorrowCode || retry === 2) {
          throw createError;
        }
      }
    }

    if (!borrow) {
      return res.status(500).json({
        message: "Không thể tạo mã phiếu mượn tự động",
      });
    }

    return res.status(201).json({
      message: "Gửi yêu cầu mượn sách thành công",
      borrow,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi tạo yêu cầu mượn", error: error.message });
  }
};

const approveBorrowRequest = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TRANGTHAI !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể duyệt phiếu đang chờ" });
    }

    const book = await Book.findOne({
      MASACH: borrow.MASACH,
      TRANGTHAI: { $ne: "DELETED" },
    });
    if (!book || book.SOQUYEN <= 0) {
      return res.status(400).json({ message: "Sách không còn sẵn để duyệt" });
    }

    const reservedBook = await Book.findOneAndUpdate(
      {
        MASACH: borrow.MASACH,
        TRANGTHAI: { $ne: "DELETED" },
        SOQUYEN: { $gt: 0 },
      },
      { $inc: { SOQUYEN: -1 } },
      { new: true },
    );

    if (!reservedBook) {
      return res.status(400).json({ message: "Sách không còn sẵn để duyệt" });
    }

    try {
      borrow.TRANGTHAI = "APPROVED";
      borrow.MSNV = staff.MSNV;
      borrow.NGAYDUYET = new Date();
      borrow.NGAYHENLAY = addDays(new Date(), DEFAULT_PICKUP_DEADLINE_DAYS);
      await borrow.save();
    } catch (saveError) {
      await Book.updateOne(
        { MASACH: borrow.MASACH, TRANGTHAI: { $ne: "DELETED" } },
        { $inc: { SOQUYEN: 1 } },
      );
      throw saveError;
    }

    return res
      .status(200)
      .json({ message: "Duyệt yêu cầu mượn thành công", borrow });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi duyệt yêu cầu", error: error.message });
  }
};

const rejectBorrowRequest = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const { reason } = req.body;

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TRANGTHAI !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể từ chối phiếu đang chờ" });
    }

    borrow.TRANGTHAI = "REJECTED";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYDUYET = new Date();
    borrow.LYDOTUCHOI = reason || "Không đáp ứng điều kiện mượn";
    await borrow.save();

    return res.status(200).json({ message: "Đã từ chối yêu cầu mượn", borrow });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi từ chối yêu cầu", error: error.message });
  }
};

const handOverBook = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TRANGTHAI !== "APPROVED") {
      return res
        .status(400)
        .json({ message: "Chỉ giao sách cho phiếu đã duyệt" });
    }

    if (borrow.NGAYHENLAY && new Date() > borrow.NGAYHENLAY) {
      borrow.TRANGTHAI = "CANCELLED";
      borrow.LYDOTUCHOI = "Quá hạn nhận sách";
      await borrow.save();

      await Book.updateOne(
        { MASACH: borrow.MASACH, TRANGTHAI: { $ne: "DELETED" } },
        { $inc: { SOQUYEN: 1 } },
      );

      return res.status(200).json({
        message: "Phiếu đã quá hạn nhận sách và bị hủy",
        borrow,
        autoCancelled: true,
      });
    }

    const now = new Date();
    borrow.TRANGTHAI = "BORROWING";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYMUON = now;
    borrow.NGAYNHAN = now;
    borrow.NGAYHENTRA = addDays(now, DEFAULT_BORROW_DAYS);
    await borrow.save();

    return res
      .status(200)
      .json({ message: "Đã giao sách cho độc giả", borrow });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi giao sách", error: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (!["BORROWING", "OVERDUE"].includes(borrow.TRANGTHAI)) {
      return res
        .status(400)
        .json({ message: "Phiếu này không ở trạng thái đang mượn" });
    }

    await Book.findOneAndUpdate(
      { MASACH: borrow.MASACH, TRANGTHAI: { $ne: "DELETED" } },
      { $inc: { SOQUYEN: 1 } },
    );

    const returnedAt = new Date();
    const overdueDays = getOverdueDays(borrow.NGAYHENTRA, returnedAt);
    const fineAmount = overdueDays * DAILY_FINE_RATE;
    const wasFinePaid =
      String(borrow.TRANGTHAI_PHAT || "").toUpperCase() === "PAID" &&
      Number(borrow.TIENPHAT || 0) > 0;

    const resolvedOverdueDays = wasFinePaid
      ? Number(borrow.SONGAYTRE || overdueDays)
      : overdueDays;
    const resolvedFineAmount = wasFinePaid
      ? Number(borrow.TIENPHAT || fineAmount)
      : fineAmount;

    borrow.TRANGTHAI = "RETURNED";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYTRA = returnedAt;
    borrow.SONGAYTRE = resolvedOverdueDays;
    borrow.TIENPHAT = resolvedFineAmount;
    borrow.TRANGTHAI_GIA_HAN = "NONE";
    borrow.NGAYYEUCAU_GIA_HAN = null;
    borrow.NGAYDUYET_GIA_HAN = null;
    borrow.LYDO_TUCHOI_GIA_HAN = null;
    borrow.TRANGTHAI_PHAT =
      wasFinePaid || resolvedFineAmount <= 0 ? "PAID" : "UNPAID";
    await borrow.save();

    if (!wasFinePaid && resolvedFineAmount > 0) {
      await Reader.findOneAndUpdate(
        { MADOCGIA: borrow.MADOCGIA },
        { $inc: { NO_PHAT: resolvedFineAmount } },
      );
    }

    return res.status(200).json({
      message: "Nhận trả sách thành công",
      borrow,
      fine: {
        overdueDays: resolvedOverdueDays,
        dailyRate: DAILY_FINE_RATE,
        amount: resolvedFineAmount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi nhận trả sách", error: error.message });
  }
};

const requestBorrowExtension = async (req, res) => {
  try {
    const reader = await getReaderFromAccount(req);
    if (!reader) {
      return res.status(403).json({ message: "Tài khoản không phải độc giả" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.MADOCGIA !== reader.MADOCGIA) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền gia hạn phiếu này" });
    }

    if (borrow.TRANGTHAI !== "BORROWING") {
      return res.status(400).json({
        message: "Chỉ có thể xin gia hạn khi phiếu đang ở trạng thái đang mượn",
      });
    }

    if (!borrow.NGAYHENTRA) {
      return res.status(400).json({ message: "Phiếu mượn chưa có hạn trả" });
    }

    const now = new Date();
    if (now >= borrow.NGAYHENTRA) {
      borrow.TRANGTHAI = "OVERDUE";
      await borrow.save();
      return res.status(400).json({
        message: "Phiếu đã đến hạn hoặc quá hạn, không thể xin gia hạn",
      });
    }

    if ((borrow.SO_LAN_GIA_HAN || 0) >= MAX_EXTENSION_COUNT) {
      return res.status(400).json({
        message: `Mỗi phiếu chỉ được gia hạn tối đa ${MAX_EXTENSION_COUNT} lần`,
      });
    }

    if (borrow.TRANGTHAI_GIA_HAN === "PENDING") {
      return res.status(400).json({
        message: "Bạn đã có yêu cầu gia hạn đang chờ nhân viên duyệt",
      });
    }

    borrow.TRANGTHAI_GIA_HAN = "PENDING";
    borrow.NGAYYEUCAU_GIA_HAN = now;
    borrow.NGAYDUYET_GIA_HAN = null;
    borrow.LYDO_TUCHOI_GIA_HAN = null;
    await borrow.save();

    return res.status(200).json({
      message: "Đã gửi yêu cầu gia hạn, vui lòng chờ nhân viên duyệt",
      borrow,
      extension: {
        requestStatus: borrow.TRANGTHAI_GIA_HAN,
        extensionCount: borrow.SO_LAN_GIA_HAN,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi xin gia hạn phiếu mượn",
      error: error.message,
    });
  }
};

const cancelBorrowRequestByReader = async (req, res) => {
  try {
    const reader = await getReaderFromAccount(req);
    if (!reader) {
      return res.status(403).json({ message: "Tài khoản không phải độc giả" });
    }

    const { reason } = req.body || {};
    const cancelReason =
      String(reason || "").trim() || "Độc giả hủy đăng ký trước khi nhận sách";

    const previousBorrow = await Borrow.findOneAndUpdate(
      {
        _id: req.params.id,
        MADOCGIA: reader.MADOCGIA,
        TRANGTHAI: { $in: ["PENDING", "APPROVED"] },
      },
      {
        $set: {
          TRANGTHAI: "CANCELLED",
          LYDOTUCHOI: cancelReason,
        },
      },
      { new: false },
    );

    if (!previousBorrow) {
      const existingBorrow = await Borrow.findById(req.params.id).select(
        "MADOCGIA TRANGTHAI",
      );

      if (!existingBorrow) {
        return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
      }

      if (existingBorrow.MADOCGIA !== reader.MADOCGIA) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền hủy phiếu này" });
      }

      return res.status(400).json({
        message:
          "Chỉ có thể hủy khi phiếu đang chờ duyệt hoặc đã duyệt nhưng chưa nhận sách",
      });
    }

    if (previousBorrow.TRANGTHAI === "APPROVED") {
      await Book.updateOne(
        { MASACH: previousBorrow.MASACH, TRANGTHAI: { $ne: "DELETED" } },
        { $inc: { SOQUYEN: 1 } },
      );
    }

    const updatedBorrow = await Borrow.findById(req.params.id);

    return res.status(200).json({
      message: "Đã hủy đăng ký mượn sách thành công",
      borrow: updatedBorrow,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi hủy đăng ký mượn",
      error: error.message,
    });
  }
};

const approveBorrowExtension = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TRANGTHAI_GIA_HAN !== "PENDING") {
      return res.status(400).json({
        message: "Phiếu này không có yêu cầu gia hạn đang chờ duyệt",
      });
    }

    if (borrow.TRANGTHAI !== "BORROWING") {
      return res.status(400).json({
        message: "Chỉ duyệt gia hạn cho phiếu đang mượn",
      });
    }

    if (!borrow.NGAYHENTRA) {
      return res.status(400).json({ message: "Phiếu mượn chưa có hạn trả" });
    }

    const now = new Date();
    if (now >= borrow.NGAYHENTRA) {
      borrow.TRANGTHAI = "OVERDUE";
      borrow.TRANGTHAI_GIA_HAN = "REJECTED";
      borrow.NGAYDUYET_GIA_HAN = now;
      borrow.LYDO_TUCHOI_GIA_HAN = "Phiếu đã đến hạn hoặc quá hạn";
      borrow.MSNV = staff.MSNV;
      await borrow.save();

      return res.status(400).json({
        message: "Phiếu đã đến hạn hoặc quá hạn, không thể duyệt gia hạn",
      });
    }

    if ((borrow.SO_LAN_GIA_HAN || 0) >= MAX_EXTENSION_COUNT) {
      borrow.TRANGTHAI_GIA_HAN = "REJECTED";
      borrow.NGAYDUYET_GIA_HAN = now;
      borrow.LYDO_TUCHOI_GIA_HAN = `Đã đạt giới hạn gia hạn ${MAX_EXTENSION_COUNT} lần`;
      borrow.MSNV = staff.MSNV;
      await borrow.save();

      return res.status(400).json({
        message: `Mỗi phiếu chỉ được gia hạn tối đa ${MAX_EXTENSION_COUNT} lần`,
      });
    }

    borrow.NGAYHENTRA = addDays(borrow.NGAYHENTRA, DEFAULT_EXTENSION_DAYS);
    borrow.SO_LAN_GIA_HAN = (borrow.SO_LAN_GIA_HAN || 0) + 1;
    borrow.NGAYGIAHAN_CUOI = now;
    borrow.TRANGTHAI_GIA_HAN = "APPROVED";
    borrow.NGAYDUYET_GIA_HAN = now;
    borrow.LYDO_TUCHOI_GIA_HAN = null;
    borrow.MSNV = staff.MSNV;
    await borrow.save();

    return res.status(200).json({
      message: `Đã duyệt gia hạn thêm ${DEFAULT_EXTENSION_DAYS} ngày`,
      borrow,
      extension: {
        extensionDays: DEFAULT_EXTENSION_DAYS,
        extensionCount: borrow.SO_LAN_GIA_HAN,
        requestStatus: borrow.TRANGTHAI_GIA_HAN,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi duyệt gia hạn phiếu mượn",
      error: error.message,
    });
  }
};

const rejectBorrowExtension = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const { reason } = req.body;
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TRANGTHAI_GIA_HAN !== "PENDING") {
      return res.status(400).json({
        message: "Phiếu này không có yêu cầu gia hạn đang chờ duyệt",
      });
    }

    borrow.TRANGTHAI_GIA_HAN = "REJECTED";
    borrow.NGAYDUYET_GIA_HAN = new Date();
    borrow.LYDO_TUCHOI_GIA_HAN =
      reason || "Yêu cầu gia hạn không được chấp nhận";
    borrow.MSNV = staff.MSNV;
    await borrow.save();

    return res.status(200).json({
      message: "Đã từ chối yêu cầu gia hạn",
      borrow,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi từ chối gia hạn phiếu mượn",
      error: error.message,
    });
  }
};

const reportLostBook = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (!["BORROWING", "OVERDUE"].includes(borrow.TRANGTHAI)) {
      return res.status(400).json({
        message: "Chỉ có thể báo mất với phiếu đang mượn hoặc quá hạn",
      });
    }

    const book = await Book.findOne({
      MASACH: borrow.MASACH,
      TRANGTHAI: { $ne: "DELETED" },
    }).select("DONGIA");

    if (!book) {
      return res.status(404).json({
        message: "Không tìm thấy sách để tính tiền bồi thường",
      });
    }

    const compensationAmount = Number(book.DONGIA || 0);

    borrow.TRANGTHAI = "LOST";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYTRA = new Date();
    borrow.TIENPHAT = compensationAmount;
    borrow.TRANGTHAI_PHAT = compensationAmount > 0 ? "UNPAID" : "PAID";
    await borrow.save();

    if (compensationAmount > 0) {
      await Reader.findOneAndUpdate(
        { MADOCGIA: borrow.MADOCGIA },
        { $inc: { NO_PHAT: compensationAmount } },
      );
    }

    return res.status(200).json({
      message: "Đã ghi nhận mất sách và áp dụng tiền bồi thường",
      borrow,
      compensation: {
        amount: compensationAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi xử lý mất sách",
      error: error.message,
    });
  }
};

const payFine = async (req, res) => {
  try {
    const staff = await getStaffFromAccount(req);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Tài khoản không phải nhân viên" });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn" });
    }

    if (borrow.TIENPHAT <= 0) {
      return res.status(400).json({ message: "Phiếu này không có tiền phạt" });
    }

    if (borrow.TRANGTHAI_PHAT === "PAID") {
      return res
        .status(400)
        .json({ message: "Phiếu này đã thanh toán tiền phạt" });
    }

    borrow.TRANGTHAI_PHAT = "PAID";
    borrow.MSNV = staff.MSNV;
    await borrow.save();

    await Reader.findOneAndUpdate(
      { MADOCGIA: borrow.MADOCGIA },
      { $inc: { NO_PHAT: -borrow.TIENPHAT } },
    );

    const reader = await Reader.findOne({ MADOCGIA: borrow.MADOCGIA });
    if (reader && reader.NO_PHAT < 0) {
      reader.NO_PHAT = 0;
      await reader.save();
    }

    return res.status(200).json({ message: "Đã thanh toán tiền phạt", borrow });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi thanh toán tiền phạt", error: error.message });
  }
};

const getMyBorrowRequests = async (req, res) => {
  try {
    const reader = await getReaderFromAccount(req);
    if (!reader) {
      return res.status(403).json({ message: "Tài khoản không phải độc giả" });
    }

    await syncExpiredPickupForReader(reader.MADOCGIA);
    await syncOverdueForReader(reader.MADOCGIA);

    const borrows = await Borrow.find({ MADOCGIA: reader.MADOCGIA }).sort({
      NGAYYEUCAU: -1,
      created_at: -1,
    });

    const bookIds = [...new Set(borrows.map((borrow) => borrow.MASACH))];
    const staffIds = [
      ...new Set(
        borrows
          .map((borrow) => String(borrow.MSNV || "").trim())
          .filter(Boolean),
      ),
    ];
    const books = await Book.find({
      MASACH: { $in: bookIds },
      TRANGTHAI: { $ne: "DELETED" },
    })
      .select("MASACH TENSACH TACGIA ANHBIA_URL")
      .lean();
    const staffs = await Staff.find({ MSNV: { $in: staffIds } })
      .select("MSNV HoTenNV ChucVu")
      .lean();

    const bookMap = new Map(books.map((book) => [book.MASACH, book]));
    const staffMap = new Map(staffs.map((staff) => [staff.MSNV, staff]));

    const enrichedBorrows = borrows.map((borrow) => {
      const book = bookMap.get(borrow.MASACH);
      const staff = staffMap.get(borrow.MSNV);

      return {
        ...borrow.toObject(),
        SACH: {
          MASACH: borrow.MASACH,
          TENSACH: book?.TENSACH || null,
          TACGIA: Array.isArray(book?.TACGIA) ? book.TACGIA : [],
          ANHBIA_URL: book?.ANHBIA_URL || "",
        },
        NHANVIEN: {
          MSNV: borrow.MSNV || null,
          HOTEN: staff?.HoTenNV || null,
          CHUCVU: staff?.ChucVu || null,
        },
      };
    });

    return res.status(200).json({
      items: enrichedBorrows,
      total: enrichedBorrows.length,
      availableStatuses: BORROW_STATUSES,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách mượn", error: error.message });
  }
};

const getBorrows = async (req, res) => {
  try {
    await syncExpiredPickup();
    await syncOverdueStateAndFine();

    const { status } = req.query;
    const filter = {};

    if (status) {
      const statuses = status
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

      const invalidStatuses = statuses.filter(
        (item) => !BORROW_STATUSES.includes(item),
      );

      if (invalidStatuses.length > 0) {
        return res.status(400).json({
          message: "Trạng thái không hợp lệ",
          invalidStatuses,
          allowedStatuses: BORROW_STATUSES,
        });
      }

      filter.TRANGTHAI = { $in: [...new Set(statuses)] };
    }

    const borrows = await Borrow.find(filter).sort({
      NGAYYEUCAU: -1,
      created_at: -1,
    });

    const readerIds = [...new Set(borrows.map((borrow) => borrow.MADOCGIA))];
    const bookIds = [...new Set(borrows.map((borrow) => borrow.MASACH))];
    const staffIds = [
      ...new Set(
        borrows
          .map((borrow) => String(borrow.MSNV || "").trim())
          .filter(Boolean),
      ),
    ];

    const [readers, books, staffs] = await Promise.all([
      Reader.find({ MADOCGIA: { $in: readerIds } })
        .select("MADOCGIA HOLOT TEN")
        .lean(),
      Book.find({ MASACH: { $in: bookIds }, TRANGTHAI: { $ne: "DELETED" } })
        .select("MASACH TENSACH TACGIA ANHBIA_URL")
        .lean(),
      Staff.find({ MSNV: { $in: staffIds } })
        .select("MSNV HoTenNV ChucVu")
        .lean(),
    ]);

    const readerMap = new Map(
      readers.map((reader) => [reader.MADOCGIA, reader]),
    );
    const bookMap = new Map(books.map((book) => [book.MASACH, book]));
    const staffMap = new Map(staffs.map((staff) => [staff.MSNV, staff]));

    const enrichedBorrows = borrows.map((borrow) => {
      const reader = readerMap.get(borrow.MADOCGIA);
      const book = bookMap.get(borrow.MASACH);
      const staff = staffMap.get(borrow.MSNV);
      const fullName = reader
        ? [reader.HOLOT, reader.TEN].filter(Boolean).join(" ").trim()
        : null;

      return {
        ...borrow.toObject(),
        DOCGIA: {
          MADOCGIA: borrow.MADOCGIA,
          HOTEN: fullName,
        },
        SACH: {
          MASACH: borrow.MASACH,
          TENSACH: book?.TENSACH || null,
          TACGIA: Array.isArray(book?.TACGIA) ? book.TACGIA : [],
          ANHBIA_URL: book?.ANHBIA_URL || "",
        },
        NHANVIEN: {
          MSNV: borrow.MSNV || null,
          HOTEN: staff?.HoTenNV || null,
          CHUCVU: staff?.ChucVu || null,
        },
      };
    });

    return res.status(200).json({
      items: enrichedBorrows,
      total: enrichedBorrows.length,
      availableStatuses: BORROW_STATUSES,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách phiếu mượn",
      error: error.message,
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    await syncExpiredPickup();

    const borrows = await Borrow.find({ TRANGTHAI: "PENDING" }).sort({
      NGAYYEUCAU: -1,
    });
    return res.status(200).json(borrows);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách chờ duyệt",
      error: error.message,
    });
  }
};

const getActiveBorrows = async (req, res) => {
  try {
    await syncExpiredPickup();

    const borrows = await Borrow.find({
      TRANGTHAI: { $in: ["APPROVED", "BORROWING", "OVERDUE"] },
    }).sort({ created_at: -1 });
    return res.status(200).json(borrows);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách đang hoạt động",
      error: error.message,
    });
  }
};

const getOverdueBorrows = async (req, res) => {
  try {
    await syncExpiredPickup();
    await syncOverdueStateAndFine();

    const borrows = await Borrow.find({ TRANGTHAI: "OVERDUE" }).sort({
      NGAYHENTRA: 1,
    });
    return res.status(200).json(borrows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách quá hạn", error: error.message });
  }
};

const syncOverdue = async (req, res) => {
  try {
    await syncExpiredPickup();

    const result = await syncOverdueStateAndFine();

    return res.status(200).json({
      message: "Đồng bộ trạng thái quá hạn thành công",
      modifiedCount: result.transitionedCount,
      updatedFineCount: result.updatedFineCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi đồng bộ quá hạn", error: error.message });
  }
};

module.exports = {
  createBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  handOverBook,
  returnBook,
  cancelBorrowRequestByReader,
  requestBorrowExtension,
  approveBorrowExtension,
  rejectBorrowExtension,
  reportLostBook,
  payFine,
  getBorrows,
  getMyBorrowRequests,
  getPendingRequests,
  getActiveBorrows,
  getOverdueBorrows,
  syncOverdue,
};
