const express = require("express");
const {
  registerStaff,
  registerReader,
  login,
  verifyToken,
  getReadersForStaff,
} = require("../controllers/authController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register/staff", registerStaff);
router.post("/register/reader", registerReader);
router.post("/login", login);
router.get("/verify", verifyToken);
router.get(
  "/readers",
  authenticate,
  authorizeRoles("staff"),
  getReadersForStaff,
);

module.exports = router;
