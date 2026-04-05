const express = require("express");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getAuthors,
  getNextAuthorCodePreview,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getGenres,
  getNextGenreCodePreview,
  createGenre,
  updateGenre,
  deleteGenre,
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
  getPublishers,
  getNextPublisherCodePreview,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require("../controllers/adminMetaController");

const router = express.Router();

router.use(authenticate, authorizeRoles("staff"));

router.get("/authors", getAuthors);
router.get("/authors/next-code", getNextAuthorCodePreview);
router.post("/authors", createAuthor);
router.put("/authors/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

router.get("/genres", getGenres);
router.get("/genres/next-code", getNextGenreCodePreview);
router.post("/genres", createGenre);
router.put("/genres/:id", updateGenre);
router.delete("/genres/:id", deleteGenre);

router.get("/staffs", getStaffs);
router.post("/staffs", createStaff);
router.put("/staffs/:id", updateStaff);
router.delete("/staffs/:id", deleteStaff);

router.get("/publishers", getPublishers);
router.get("/publishers/next-code", getNextPublisherCodePreview);
router.post("/publishers", createPublisher);
router.put("/publishers/:id", updatePublisher);
router.delete("/publishers/:id", deletePublisher);

module.exports = router;
