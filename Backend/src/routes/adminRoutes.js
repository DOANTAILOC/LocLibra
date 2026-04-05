const express = require("express");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getGenres,
  createGenre,
  updateGenre,
  deleteGenre,
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require("../controllers/adminMetaController");

const router = express.Router();

router.use(authenticate, authorizeRoles("staff"));

router.get("/authors", getAuthors);
router.post("/authors", createAuthor);
router.put("/authors/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

router.get("/genres", getGenres);
router.post("/genres", createGenre);
router.put("/genres/:id", updateGenre);
router.delete("/genres/:id", deleteGenre);

router.get("/staffs", getStaffs);
router.post("/staffs", createStaff);
router.put("/staffs/:id", updateStaff);
router.delete("/staffs/:id", deleteStaff);

router.get("/publishers", getPublishers);
router.post("/publishers", createPublisher);
router.put("/publishers/:id", updatePublisher);
router.delete("/publishers/:id", deletePublisher);

module.exports = router;
