const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const Reader = require("../models/Reader");
const Staff = require("../models/Staff");

const MAX_ACTIVE_BORROWS = 5;
const DEFAULT_BORROW_DAYS = 14;
const DEFAULT_PICKUP_DEADLINE_DAYS = 2;
const DAILY_FINE_RATE = 2000;

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

const syncOverdueForReader = async (madocgia) => {
  return Borrow.updateMany(
    {
      MADOCGIA: madocgia,
      TRANGTHAI: "BORROWING",
      NGAYHENTRA: { $lt: new Date() },
    },
    { $set: { TRANGTHAI: "OVERDUE" } },
  );
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

    const book = await Book.findOne({ MASACH });
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

    const borrow = await Borrow.create({
      MADOCGIA: reader.MADOCGIA,
      MASACH,
      TRANGTHAI: "PENDING",
      NGAYYEUCAU: new Date(),
    });

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

    const book = await Book.findOne({ MASACH: borrow.MASACH });
    if (!book || book.SOQUYEN <= 0) {
      return res.status(400).json({ message: "Sách không còn sẵn để duyệt" });
    }

    borrow.TRANGTHAI = "APPROVED";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYDUYET = new Date();
    borrow.NGAYHENLAY = addDays(new Date(), DEFAULT_PICKUP_DEADLINE_DAYS);
    await borrow.save();

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
      return res
        .status(400)
        .json({ message: "Phiếu đã quá hạn nhận sách và bị hủy" });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { MASACH: borrow.MASACH, SOQUYEN: { $gt: 0 } },
      { $inc: { SOQUYEN: -1 } },
      { new: true },
    );

    if (!updatedBook) {
      return res.status(400).json({ message: "Sách đã hết, không thể giao" });
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
      { MASACH: borrow.MASACH },
      { $inc: { SOQUYEN: 1 } },
    );

    const returnedAt = new Date();
    const overdueDays = getOverdueDays(borrow.NGAYHENTRA, returnedAt);
    const fineAmount = overdueDays * DAILY_FINE_RATE;

    borrow.TRANGTHAI = "RETURNED";
    borrow.MSNV = staff.MSNV;
    borrow.NGAYTRA = returnedAt;
    borrow.SONGAYTRE = overdueDays;
    borrow.TIENPHAT = fineAmount;
    borrow.TRANGTHAI_PHAT = fineAmount > 0 ? "UNPAID" : "PAID";
    await borrow.save();

    if (fineAmount > 0) {
      await Reader.findOneAndUpdate(
        { MADOCGIA: borrow.MADOCGIA },
        { $inc: { NO_PHAT: fineAmount } },
      );
    }

    return res.status(200).json({
      message: "Nhận trả sách thành công",
      borrow,
      fine: {
        overdueDays,
        dailyRate: DAILY_FINE_RATE,
        amount: fineAmount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi nhận trả sách", error: error.message });
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

    await syncOverdueForReader(reader.MADOCGIA);

    const borrows = await Borrow.find({ MADOCGIA: reader.MADOCGIA }).sort({
      NGAYYEUCAU: -1,
    });
    return res.status(200).json(borrows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách mượn", error: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const borrows = await Borrow.find({ TRANGTHAI: "PENDING" }).sort({
      NGAYYEUCAU: -1,
    });
    return res.status(200).json(borrows);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách chờ duyệt",
        error: error.message,
      });
  }
};

const getActiveBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      TRANGTHAI: { $in: ["APPROVED", "BORROWING", "OVERDUE"] },
    }).sort({ created_at: -1 });
    return res.status(200).json(borrows);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách đang hoạt động",
        error: error.message,
      });
  }
};

const getOverdueBorrows = async (req, res) => {
  try {
    await Borrow.updateMany(
      {
        TRANGTHAI: "BORROWING",
        NGAYHENTRA: { $lt: new Date() },
      },
      { $set: { TRANGTHAI: "OVERDUE" } },
    );

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
    const result = await Borrow.updateMany(
      {
        TRANGTHAI: "BORROWING",
        NGAYHENTRA: { $lt: new Date() },
      },
      { $set: { TRANGTHAI: "OVERDUE" } },
    );

    return res.status(200).json({
      message: "Đồng bộ trạng thái quá hạn thành công",
      modifiedCount: result.modifiedCount,
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
  payFine,
  getMyBorrowRequests,
  getPendingRequests,
  getActiveBorrows,
  getOverdueBorrows,
  syncOverdue,
};
