const express = require("express");
const {
  registerStaff,
  registerReader,
  login,
  verifyToken,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register/staff", registerStaff);
router.post("/register/reader", registerReader);
router.post("/login", login);
router.get("/verify", verifyToken);

module.exports = router;
