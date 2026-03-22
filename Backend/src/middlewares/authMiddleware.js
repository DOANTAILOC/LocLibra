const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findById(decoded.accountId);
    if (!account) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    req.account = {
      id: account._id,
      username: account.username,
      role: account.role,
      staffId: account.staffId,
      readerId: account.readerId,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ message: "Chưa xác thực" });
    }

    if (!allowedRoles.includes(req.account.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
