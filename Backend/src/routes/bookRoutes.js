const express = require("express");
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authenticate, authorizeRoles("staff"), createBook);
router.put("/:id", authenticate, authorizeRoles("staff"), updateBook);
router.delete("/:id", authenticate, authorizeRoles("staff"), deleteBook);

module.exports = router;
