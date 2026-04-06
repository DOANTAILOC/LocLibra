const express = require("express");
const {
  createBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  handOverBook,
  returnBook,
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
router.patch(
  "/:id/extend",
  authenticate,
  authorizeRoles("reader"),
  requestBorrowExtension,
);

router.get("/", authenticate, authorizeRoles("staff"), getBorrows);

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
router.patch(
  "/:id/approve-extension",
  authenticate,
  authorizeRoles("staff"),
  approveBorrowExtension,
);
router.patch(
  "/:id/reject-extension",
  authenticate,
  authorizeRoles("staff"),
  rejectBorrowExtension,
);
router.patch(
  "/:id/lost",
  authenticate,
  authorizeRoles("staff"),
  reportLostBook,
);
router.patch("/:id/pay-fine", authenticate, authorizeRoles("staff"), payFine);

module.exports = router;
