const express = require("express");
const {
  registerStaff,
  registerReader,
  login,
  verifyToken,
  getReadersForStaff,
  updateMyReaderProfile,
  uploadMyAvatar,
} = require("../controllers/authController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const { uploadAvatar } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register/staff", registerStaff);
router.post("/register/reader", registerReader);
router.post("/login", login);
router.get("/verify", verifyToken);
router.patch(
  "/my-profile",
  authenticate,
  authorizeRoles("reader"),
  updateMyReaderProfile,
);
router.post(
  "/my-avatar",
  authenticate,
  authorizeRoles("reader"),
  uploadAvatar,
  uploadMyAvatar,
);
router.get(
  "/readers",
  authenticate,
  authorizeRoles("staff"),
  getReadersForStaff,
);

module.exports = router;
