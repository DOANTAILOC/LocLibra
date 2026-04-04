const Vote = require("../models/Vote");
const Book = require("../models/Book");

const buildBookVoteSummary = async (masach) => {
  const [stats, votes] = await Promise.all([
    Vote.aggregate([
      { $match: { MASACH: masach } },
      {
        $group: {
          _id: "$MASACH",
          totalVotes: { $sum: 1 },
          averageScore: { $avg: "$DIEM" },
        },
      },
    ]),
    Vote.find({ MASACH: masach })
      .populate({
        path: "ACCOUNT_ID",
        select: "username role",
      })
      .sort({ updated_at: -1 })
      .lean(),
  ]);

  const summary = stats[0] || { totalVotes: 0, averageScore: 0 };

  return {
    MASACH: masach,
    totalVotes: summary.totalVotes || 0,
    averageScore: Number(summary.averageScore || 0).toFixed(1),
    voters: votes.map((item) => ({
      accountId: item.ACCOUNT_ID?._id || null,
      username: item.ACCOUNT_ID?.username || "unknown",
      role: item.ACCOUNT_ID?.role || null,
      score: item.DIEM,
      votedAt: item.updated_at,
    })),
  };
};

const getVotesByBook = async (req, res) => {
  try {
    const { masach } = req.params;

    const bookExists = await Book.exists({ MASACH: masach });
    if (!bookExists) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    const result = await buildBookVoteSummary(masach);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy dữ liệu vote", error: error.message });
  }
};

const upsertVote = async (req, res) => {
  try {
    const { masach } = req.params;
    const score = Number(req.body?.score || req.body?.DIEM);

    if (!Number.isFinite(score) || score < 1 || score > 5) {
      return res.status(400).json({ message: "Điểm vote phải từ 1 đến 5" });
    }

    const bookExists = await Book.exists({ MASACH: masach });
    if (!bookExists) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    await Vote.findOneAndUpdate(
      {
        MASACH: masach,
        ACCOUNT_ID: req.account.id,
      },
      {
        MASACH: masach,
        ACCOUNT_ID: req.account.id,
        DIEM: score,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const result = await buildBookVoteSummary(masach);

    return res.status(200).json({
      message: "Vote thành công",
      ...result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi vote sách", error: error.message });
  }
};

const deleteMyVote = async (req, res) => {
  try {
    const { masach } = req.params;

    const deleted = await Vote.findOneAndDelete({
      MASACH: masach,
      ACCOUNT_ID: req.account.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Bạn chưa vote sách này" });
    }

    const result = await buildBookVoteSummary(masach);

    return res.status(200).json({
      message: "Đã hủy vote",
      ...result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi hủy vote", error: error.message });
  }
};

module.exports = {
  getVotesByBook,
  upsertVote,
  deleteMyVote,
};
