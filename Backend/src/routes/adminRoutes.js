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
  getNextStaffCodePreview,
  createStaff,
  updateStaff,
  deleteStaff,
  getPublishers,
  getNextPublisherCodePreview,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getDashboardSummary,
} = require("../controllers/adminMetaController");

const router = express.Router();

router.use(authenticate, authorizeRoles("staff", "admin"));

router.get("/dashboard-summary", getDashboardSummary);

router.get("/authors", getAuthors);
router.get("/authors/next-code", getNextAuthorCodePreview);
router.post("/authors", authorizeRoles("admin"), createAuthor);
router.put("/authors/:id", authorizeRoles("admin"), updateAuthor);
router.delete("/authors/:id", authorizeRoles("admin"), deleteAuthor);

router.get("/genres", getGenres);
router.get("/genres/next-code", getNextGenreCodePreview);
router.post("/genres", authorizeRoles("admin"), createGenre);
router.put("/genres/:id", authorizeRoles("admin"), updateGenre);
router.delete("/genres/:id", authorizeRoles("admin"), deleteGenre);

router.get("/staffs", getStaffs);
router.get("/staffs/next-code", getNextStaffCodePreview);
router.post("/staffs", authorizeRoles("admin"), createStaff);
router.put("/staffs/:id", authorizeRoles("admin"), updateStaff);
router.delete("/staffs/:id", authorizeRoles("admin"), deleteStaff);

router.get("/publishers", getPublishers);
router.get("/publishers/next-code", getNextPublisherCodePreview);
router.post("/publishers", authorizeRoles("admin"), createPublisher);
router.put("/publishers/:id", authorizeRoles("admin"), updatePublisher);
router.delete("/publishers/:id", authorizeRoles("admin"), deletePublisher);

module.exports = router;
