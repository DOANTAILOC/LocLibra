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

router.get("/", authenticate, authorizeRoles("staff", "admin"), getBorrows);

router.get(
  "/pending",
  authenticate,
  authorizeRoles("staff", "admin"),
  getPendingRequests,
);
router.get(
  "/active",
  authenticate,
  authorizeRoles("staff", "admin"),
  getActiveBorrows,
);
router.get(
  "/overdue",
  authenticate,
  authorizeRoles("staff", "admin"),
  getOverdueBorrows,
);
router.patch(
  "/sync-overdue",
  authenticate,
  authorizeRoles("staff", "admin"),
  syncOverdue,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("staff", "admin"),
  approveBorrowRequest,
);
router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("staff", "admin"),
  rejectBorrowRequest,
);
router.patch(
  "/:id/hand-over",
  authenticate,
  authorizeRoles("staff", "admin"),
  handOverBook,
);
router.patch(
  "/:id/return",
  authenticate,
  authorizeRoles("staff", "admin"),
  returnBook,
);
router.patch(
  "/:id/approve-extension",
  authenticate,
  authorizeRoles("staff", "admin"),
  approveBorrowExtension,
);
router.patch(
  "/:id/reject-extension",
  authenticate,
  authorizeRoles("staff", "admin"),
  rejectBorrowExtension,
);
router.patch(
  "/:id/lost",
  authenticate,
  authorizeRoles("staff", "admin"),
  reportLostBook,
);
router.patch(
  "/:id/pay-fine",
  authenticate,
  authorizeRoles("staff", "admin"),
  payFine,
);

module.exports = router;
