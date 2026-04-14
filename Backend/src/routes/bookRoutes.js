const express = require("express");
const {
  getNextBookCodePreview,
  getBooks,
  getBookById,
  getBookBorrowStats,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCoverImage,
} = require("../controllers/bookController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const { uploadBookCover } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/borrow-stats", getBookBorrowStats);
router.get(
  "/next-code",
  authenticate,
  authorizeRoles("admin"),
  getNextBookCodePreview,
);
router.post(
  "/upload-cover",
  authenticate,
  authorizeRoles("admin"),
  uploadBookCover,
  uploadBookCoverImage,
);
router.get("/:id", getBookById);
router.post("/", authenticate, authorizeRoles("admin"), createBook);
router.put("/:id", authenticate, authorizeRoles("admin"), updateBook);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteBook);

module.exports = router;
