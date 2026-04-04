const express = require("express");
const {
  getVotesByBook,
  upsertVote,
  deleteMyVote,
} = require("../controllers/voteController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/books/:masach", getVotesByBook);
router.post("/books/:masach", authenticate, upsertVote);
router.delete("/books/:masach", authenticate, deleteMyVote);

module.exports = router;
