const express = require("express");
const {
  getBooks,
  getBookById,
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
router.post(
  "/upload-cover",
  authenticate,
  authorizeRoles("staff"),
  uploadBookCover,
  uploadBookCoverImage,
);
router.get("/:id", getBookById);
router.post("/", authenticate, authorizeRoles("staff"), createBook);
router.put("/:id", authenticate, authorizeRoles("staff"), updateBook);
router.delete("/:id", authenticate, authorizeRoles("staff"), deleteBook);

module.exports = router;
