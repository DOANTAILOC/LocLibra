const express = require("express");
const {
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
} = require("../controllers/borrowController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/request",
  authenticate,
  authorizeRoles("reader"),
  createBorrowRequest,
);
router.get("/my", authenticate, authorizeRoles("reader"), getMyBorrowRequests);

router.get(
  "/pending",
  authenticate,
  authorizeRoles("staff"),
  getPendingRequests,
);
router.get("/active", authenticate, authorizeRoles("staff"), getActiveBorrows);
router.get(
  "/overdue",
  authenticate,
  authorizeRoles("staff"),
  getOverdueBorrows,
);
router.patch(
  "/sync-overdue",
  authenticate,
  authorizeRoles("staff"),
  syncOverdue,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("staff"),
  approveBorrowRequest,
);
router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("staff"),
  rejectBorrowRequest,
);
router.patch(
  "/:id/hand-over",
  authenticate,
  authorizeRoles("staff"),
  handOverBook,
);
router.patch("/:id/return", authenticate, authorizeRoles("staff"), returnBook);
router.patch("/:id/pay-fine", authenticate, authorizeRoles("staff"), payFine);

module.exports = router;
