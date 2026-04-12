const Author = require("../models/Author");
const Genre = require("../models/Genre");
const Staff = require("../models/Staff");
const Account = require("../models/Account");
const Publisher = require("../models/Publisher");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const Reader = require("../models/Reader");

const toRegex = (q) => ({ $regex: q, $options: "i" });

const generateNextPublisherCode = async () => {
  const existing = await Publisher.find({ MANXB: /^NXB\d+$/i })
    .select("MANXB")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MANXB).replace(/^NXB/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `NXB${String(maxOrder + 1).padStart(3, "0")}`;
};

const generateNextAuthorCode = async () => {
  const existing = await Author.find({ MATG: /^TG\d+$/i })
    .select("MATG")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MATG).replace(/^TG/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `TG${String(maxOrder + 1).padStart(3, "0")}`;
};

const generateNextGenreCode = async () => {
  const existing = await Genre.find({ MATL: /^TL\d+$/i })
    .select("MATL")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MATL).replace(/^TL/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `TL${String(maxOrder + 1).padStart(3, "0")}`;
};

const generateNextStaffCode = async () => {
  const existing = await Staff.find({ MSNV: /^NV\d+$/i })
    .select("MSNV")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MSNV).replace(/^NV/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `NV${String(maxOrder + 1).padStart(3, "0")}`;
};

const normalizeError = (res, message, error, status = 500) => {
  return res.status(status).json({ message, error: error.message });
};

const BORROW_STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  BORROWING: "Đang mượn",
  OVERDUE: "Quá hạn",
  RETURNED: "Đã trả",
  LOST: "Mất sách",
  CANCELLED: "Đã hủy",
};

const toDisplayBorrowStatus = (borrow) => {
  if (
    borrow?.TRANGTHAI_GIA_HAN === "PENDING" &&
    ["BORROWING", "OVERDUE"].includes(String(borrow?.TRANGTHAI || ""))
  ) {
    return { status: "extension_pending", statusLabel: "Xin gia hạn" };
  }

  const base = String(borrow?.TRANGTHAI || "").toUpperCase();
  return {
    status: base.toLowerCase(),
    statusLabel: BORROW_STATUS_LABEL[base] || "Không rõ",
  };
};

const getReaderFullName = (reader) => {
  if (!reader) return "Không rõ";
  const fullName = [reader.HOLOT, reader.TEN]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" ");
  return fullName || "Không rõ";
};

const getDashboardSummary = async (req, res) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalTitles,
      totalCopiesAgg,
      activeBorrowCount,
      newMembersThisMonth,
      pendingRequests,
      totalBorrowRecords,
      recentBorrows,
    ] = await Promise.all([
      Book.countDocuments({ TRANGTHAI: { $ne: "DELETED" } }),
      Book.aggregate([
        { $match: { TRANGTHAI: { $ne: "DELETED" } } },
        {
          $group: {
            _id: null,
            totalCopies: { $sum: { $ifNull: ["$SOQUYEN", 0] } },
          },
        },
      ]),
      Borrow.countDocuments({ TRANGTHAI: { $in: ["BORROWING", "OVERDUE"] } }),
      Reader.countDocuments({ created_at: { $gte: monthStart } }),
      Borrow.countDocuments({
        $or: [{ TRANGTHAI: "PENDING" }, { TRANGTHAI_GIA_HAN: "PENDING" }],
      }),
      Borrow.countDocuments({}),
      Borrow.find({}).sort({ NGAYYEUCAU: -1, created_at: -1 }).limit(10).lean(),
    ]);

    const masachList = [
      ...new Set(recentBorrows.map((item) => item.MASACH).filter(Boolean)),
    ];
    const madocgiaList = [
      ...new Set(recentBorrows.map((item) => item.MADOCGIA).filter(Boolean)),
    ];

    const [books, readers] = await Promise.all([
      Book.find({ MASACH: { $in: masachList } })
        .select("MASACH TENSACH TACGIA")
        .lean(),
      Reader.find({ MADOCGIA: { $in: madocgiaList } })
        .select("MADOCGIA HOLOT TEN")
        .lean(),
    ]);

    const booksMap = new Map(books.map((item) => [item.MASACH, item]));
    const readersMap = new Map(readers.map((item) => [item.MADOCGIA, item]));

    const recentBorrowRows = recentBorrows.map((item) => {
      const book = booksMap.get(item.MASACH);
      const reader = readersMap.get(item.MADOCGIA);
      const authorNames = Array.isArray(book?.TACGIA)
        ? book.TACGIA.filter(Boolean).join(", ")
        : String(book?.TACGIA || "").trim();
      const displayStatus = toDisplayBorrowStatus(item);

      return {
        id: String(item._id),
        book: book?.TENSACH || "Không rõ",
        author: authorNames || "Không rõ",
        member: getReaderFullName(reader),
        memberId: reader?.MADOCGIA || item.MADOCGIA || "Không rõ",
        borrowedAt: item.NGAYMUON || item.NGAYNHAN || item.NGAYYEUCAU || null,
        dueAt: item.NGAYHENTRA || null,
        status: displayStatus.status,
        statusLabel: displayStatus.statusLabel,
      };
    });

    return res.status(200).json({
      stats: {
        totalBooks: Number(totalCopiesAgg?.[0]?.totalCopies || 0),
        totalTitles,
        activeBorrowCount,
        newMembersThisMonth,
        pendingRequests,
        totalBorrowRecords,
      },
      recentBorrowRows,
    });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy dữ liệu dashboard", error);
  }
};

const getAuthors = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MATG: keyword }, { Hoten: keyword }, { QuocTich: keyword }],
      };
    }

    const items = await Author.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách tác giả", error);
  }
};

const getNextAuthorCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextAuthorCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã tác giả kế tiếp", error);
  }
};

const createAuthor = async (req, res) => {
  try {
    const payload = {
      Hoten: req.body?.Hoten,
      TieuSu: req.body?.TieuSu,
      QuocTich: req.body?.QuocTich,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MATG = await generateNextAuthorCode();

      try {
        const item = await Author.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MATG;
        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã tác giả" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo tác giả", error, 400);
  }
};

const updateAuthor = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MATG;

    const item = await Author.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật tác giả", error, 400);
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const item = await Author.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }

    return res.status(200).json({ message: "Xóa tác giả thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa tác giả", error);
  }
};

const getGenres = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MATL: keyword }, { name: keyword }, { description: keyword }],
      };
    }

    const items = await Genre.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách thể loại", error);
  }
};

const getNextGenreCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextGenreCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã thể loại kế tiếp", error);
  }
};

const createGenre = async (req, res) => {
  try {
    const payload = {
      name: req.body?.name,
      description: req.body?.description,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MATL = await generateNextGenreCode();

      try {
        const item = await Genre.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MATL;
        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã thể loại" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo thể loại", error, 400);
  }
};

const updateGenre = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MATL;

    const item = await Genre.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật thể loại", error, 400);
  }
};

const deleteGenre = async (req, res) => {
  try {
    const item = await Genre.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json({ message: "Xóa thể loại thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa thể loại", error);
  }
};

const getStaffs = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [
          { HoTenNV: keyword },
          { MSNV: keyword },
          { SoDienThoai: keyword },
        ],
      };
    }

    const staffs = await Staff.find(filter).sort({ created_at: -1 }).lean();
    const staffObjectIds = staffs.map((item) => item._id);
    const accounts = await Account.find({
      role: { $in: ["staff", "admin"] },
      staffId: { $in: staffObjectIds },
    })
      .select("staffId username role")
      .lean();

    const accountMap = new Map(
      accounts.map((item) => [String(item.staffId), item]),
    );

    const items = staffs.map((staff) => {
      const linkedAccount = accountMap.get(String(staff._id));
      return {
        ...staff,
        username: linkedAccount?.username || "",
        accountRole: linkedAccount?.role || "staff",
      };
    });

    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách nhân viên", error);
  }
};

const getNextStaffCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextStaffCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã nhân viên kế tiếp", error);
  }
};

const createStaff = async (req, res) => {
  try {
    const {
      HoTenNV,
      ChucVu,
      DiaChi,
      SoDienThoai,
      username,
      password,
      accountRole,
    } = req.body || {};

    if (!username) {
      return res.status(400).json({
        message: "Vui lòng nhập username để nhân viên đăng nhập",
      });
    }

    const normalizedAccountRole =
      String(accountRole || "staff").toLowerCase() === "admin"
        ? "admin"
        : "staff";
    const rawPassword = String(password || "").trim();
    const finalPassword = rawPassword || "123";

    for (let retry = 0; retry < 3; retry += 1) {
      const generatedMSNV = await generateNextStaffCode();

      let item;
      try {
        item = await Staff.create({
          MSNV: generatedMSNV,
          HoTenNV,
          ChucVu,
          DiaChi,
          SoDienThoai,
        });
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MSNV;
        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
        continue;
      }

      try {
        await Account.create({
          username,
          password: finalPassword,
          role: normalizedAccountRole,
          staffId: item._id,
        });
      } catch (accountError) {
        await Staff.findByIdAndDelete(item._id);
        if (
          accountError?.code === 11000 &&
          accountError?.keyPattern?.username
        ) {
          return res.status(409).json({ message: "Username đã tồn tại" });
        }
        throw accountError;
      }

      const payload = item.toObject();
      payload.username = String(username).toLowerCase();
      payload.accountRole = normalizedAccountRole;
      return res.status(201).json(payload);
    }

    return res.status(500).json({ message: "Không thể tạo mã nhân viên" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo nhân viên", error, 400);
  }
};

const updateStaff = async (req, res) => {
  try {
    const { username, password, accountRole, ...staffPayload } = req.body || {};
    delete staffPayload.MSNV;

    const item = await Staff.findByIdAndUpdate(req.params.id, staffPayload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    const account = await Account.findOne({
      role: { $in: ["staff", "admin"] },
      staffId: item._id,
    });
    const normalizedAccountRole =
      String(accountRole || "").toLowerCase() === "admin" ? "admin" : "staff";
    if (account) {
      if (username) {
        account.username = String(username).trim().toLowerCase();
      }
      if (password) {
        account.password = password;
      }
      if (accountRole) {
        account.role = normalizedAccountRole;
      }

      if (username || password || accountRole) {
        await account.save();
      }
    } else if (username) {
      await Account.create({
        username,
        password: String(password || "").trim() || "123",
        role: normalizedAccountRole,
        staffId: item._id,
      });
    }

    const payload = item.toObject();
    payload.username = username || account?.username || "";
    payload.accountRole = accountRole || account?.role || "staff";
    return res.status(200).json(payload);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }
    return normalizeError(res, "Lỗi khi cập nhật nhân viên", error, 400);
  }
};

const deleteStaff = async (req, res) => {
  try {
    const item = await Staff.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    await Account.deleteMany({
      role: { $in: ["staff", "admin"] },
      staffId: item._id,
    });

    return res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa nhân viên", error);
  }
};

const getPublishers = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MANXB: keyword }, { TENNXB: keyword }, { DIACHI: keyword }],
      };
    }

    const items = await Publisher.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách nhà xuất bản", error);
  }
};

const getNextPublisherCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextPublisherCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã nhà xuất bản kế tiếp", error);
  }
};

const createPublisher = async (req, res) => {
  try {
    const payload = {
      TENNXB: req.body?.TENNXB,
      DIACHI: req.body?.DIACHI,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MANXB = await generateNextPublisherCode();

      try {
        const item = await Publisher.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MANXB;

        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã nhà xuất bản" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo nhà xuất bản", error, 400);
  }
};

const updatePublisher = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MANXB;

    const item = await Publisher.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật nhà xuất bản", error, 400);
  }
};

const deletePublisher = async (req, res) => {
  try {
    const item = await Publisher.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });
    }

    return res.status(200).json({ message: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa nhà xuất bản", error);
  }
};

module.exports = {
  getAuthors,
  getNextAuthorCodePreview,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getGenres,
  getNextGenreCodePreview,
  createGenre,
  updateGenre,
  deleteGenre,
  getStaffs,
  getNextStaffCodePreview,
  createStaff,
  updateStaff,
  deleteStaff,
  getPublishers,
  getNextPublisherCodePreview,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getDashboardSummary,
};
