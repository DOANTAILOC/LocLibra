const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const Reader = require("../models/Reader");
const Account = require("../models/Account");
const Borrow = require("../models/Borrow");

const getRedirectPathByRole = (role) => {
  return role === "staff" ? "/" : "/my-loans";
};

const generateToken = (account) => {
  return jwt.sign(
    { accountId: account._id, role: account.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

const generateReaderCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    code = `DG${Date.now().toString().slice(-6)}${randomPart}`;
    exists = await Reader.exists({ MADOCGIA: code });
  }

  return code;
};

const registerStaff = async (req, res) => {
  try {
    const { MSNV, HoTenNV, ChucVu, DiaChi, SoDienThoai, username, password } =
      req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp username và password" });
    }

    const existingStaff = await Staff.findOne({ MSNV });
    if (existingStaff) {
      return res.status(409).json({ message: "Mã nhân viên đã tồn tại" });
    }

    const newStaff = await Staff.create({
      MSNV,
      HoTenNV,
      ChucVu,
      DiaChi,
      SoDienThoai,
    });

    try {
      const newAccount = await Account.create({
        username,
        password,
        role: "staff",
        staffId: newStaff._id,
      });

      const token = generateToken(newAccount);

      return res.status(201).json({
        message: "Đăng ký tài khoản nhân viên thành công",
        token,
        role: newAccount.role,
        redirectPath: getRedirectPathByRole(newAccount.role),
        staff: {
          id: newStaff._id,
          MSNV: newStaff.MSNV,
          HoTenNV: newStaff.HoTenNV,
          ChucVu: newStaff.ChucVu,
        },
      });
    } catch (error) {
      await Staff.findByIdAndDelete(newStaff._id);
      if (error.code === 11000) {
        return res.status(409).json({ message: "Username đã tồn tại" });
      }
      return res
        .status(400)
        .json({ message: "Lỗi khi tạo tài khoản", error: error.message });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi khi đăng ký nhân viên", error: error.message });
  }
};

const registerReader = async (req, res) => {
  try {
    const {
      MADOCGIA,
      HOLOT,
      TEN,
      NGAYSINH,
      PHAI,
      DIACHI,
      DIENTHOAI,
      username,
      password,
    } = req.body;

    const normalizedCode = MADOCGIA?.trim() || (await generateReaderCode());

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp username và password" });
    }

    const existingReader = await Reader.findOne({ MADOCGIA: normalizedCode });
    if (existingReader) {
      return res.status(409).json({ message: "Mã độc giả đã tồn tại" });
    }

    const newReader = await Reader.create({
      MADOCGIA: normalizedCode,
      HOLOT,
      TEN,
      NGAYSINH,
      PHAI,
      DIACHI,
      DIENTHOAI,
    });

    try {
      const newAccount = await Account.create({
        username,
        password,
        role: "reader",
        readerId: newReader._id,
      });

      const token = generateToken(newAccount);

      return res.status(201).json({
        message: "Đăng ký tài khoản độc giả thành công",
        token,
        role: newAccount.role,
        redirectPath: getRedirectPathByRole(newAccount.role),
        reader: {
          id: newReader._id,
          MADOCGIA: newReader.MADOCGIA,
          HOLOT: newReader.HOLOT,
          TEN: newReader.TEN,
        },
      });
    } catch (error) {
      await Reader.findByIdAndDelete(newReader._id);
      if (error.code === 11000) {
        return res.status(409).json({ message: "Username đã tồn tại" });
      }
      return res
        .status(400)
        .json({ message: "Lỗi khi tạo tài khoản", error: error.message });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi khi đăng ký độc giả", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp username và password" });
    }

    const account = await Account.findOne({
      username: username.toLowerCase(),
    }).select("+password");
    if (!account) {
      return res
        .status(401)
        .json({ message: "Username hoặc mật khẩu không đúng" });
    }

    const isPasswordValid = await account.verifyPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Username hoặc mật khẩu không đúng" });
    }

    const token = generateToken(account);

    let profile = null;
    if (account.role === "staff" && account.staffId) {
      profile = await Staff.findById(account.staffId);
    }
    if (account.role === "reader" && account.readerId) {
      profile = await Reader.findById(account.readerId);
    }

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      role: account.role,
      redirectPath: getRedirectPathByRole(account.role),
      account: {
        id: account._id,
        username: account.username,
      },
      profile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const account = await Account.findById(decoded.accountId);

    if (!account) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    let profile = null;
    if (account.role === "staff" && account.staffId) {
      profile = await Staff.findById(account.staffId);
    }
    if (account.role === "reader" && account.readerId) {
      profile = await Reader.findById(account.readerId);
    }

    return res.status(200).json({
      message: "Token hợp lệ",
      role: account.role,
      redirectPath: getRedirectPathByRole(account.role),
      account: {
        id: account._id,
        username: account.username,
      },
      profile,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const getReadersForStaff = async (req, res) => {
  try {
    const search = req.query.q?.trim() || "";
    const query = {};

    if (search) {
      query.$or = [
        { MADOCGIA: { $regex: search, $options: "i" } },
        { HOLOT: { $regex: search, $options: "i" } },
        { TEN: { $regex: search, $options: "i" } },
        { DIENTHOAI: { $regex: search, $options: "i" } },
      ];
    }

    const readers = await Reader.find(query).sort({ created_at: -1 }).lean();

    const readerCodes = readers.map((reader) => reader.MADOCGIA);
    const borrowStats = await Borrow.aggregate([
      { $match: { MADOCGIA: { $in: readerCodes } } },
      {
        $group: {
          _id: "$MADOCGIA",
          totalBorrows: { $sum: 1 },
          activeBorrows: {
            $sum: {
              $cond: [{ $in: ["$TRANGTHAI", ["BORROWING", "OVERDUE"]] }, 1, 0],
            },
          },
          overdueBorrows: {
            $sum: {
              $cond: [{ $eq: ["$TRANGTHAI", "OVERDUE"] }, 1, 0],
            },
          },
          latestBorrowAt: { $max: "$NGAYMUON" },
          latestRequestAt: { $max: "$NGAYYEUCAU" },
        },
      },
    ]);

    const statsMap = new Map(borrowStats.map((item) => [item._id, item]));

    const items = readers.map((reader) => {
      const stats = statsMap.get(reader.MADOCGIA);
      const fullName = [reader.HOLOT, reader.TEN]
        .filter(Boolean)
        .join(" ")
        .trim();
      const hasDebt = (reader.NO_PHAT || 0) > 0;
      const hasOverdue = (stats?.overdueBorrows || 0) > 0;

      return {
        ...reader,
        HOTEN: fullName,
        status: hasDebt || hasOverdue ? "TEMP_LOCKED" : "ACTIVE",
        stats: {
          totalBorrows: stats?.totalBorrows || 0,
          activeBorrows: stats?.activeBorrows || 0,
          overdueBorrows: stats?.overdueBorrows || 0,
          latestBorrowAt: stats?.latestBorrowAt || null,
          latestRequestAt: stats?.latestRequestAt || null,
        },
      };
    });

    return res.status(200).json({ items, total: items.length });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách thành viên",
        error: error.message,
      });
  }
};

module.exports = {
  registerStaff,
  registerReader,
  login,
  verifyToken,
  getReadersForStaff,
};
