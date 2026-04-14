const Author = require("../models/Author");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const Reader = require("../models/Reader");

const countableBorrowStatuses = [
  "APPROVED",
  "BORROWING",
  "OVERDUE",
  "RETURNED",
  "LOST",
];

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const extractYear = (value) => {
  if (!value) return null;
  const year = new Date(value).getFullYear();
  if (Number.isNaN(year)) return null;
  return year;
};

const getAboutPageData = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const [
      totalBooks,
      totalReaders,
      totalBorrows,
      earliestBook,
      earliestReader,
      earliestBorrow,
      topAuthorRows,
    ] = await Promise.all([
      Book.countDocuments({ TRANGTHAI: { $ne: "DELETED" } }),
      Reader.countDocuments({}),
      Borrow.countDocuments({ TRANGTHAI: { $in: countableBorrowStatuses } }),
      Book.findOne({ created_at: { $exists: true, $ne: null } })
        .sort({ created_at: 1 })
        .select("created_at")
        .lean(),
      Reader.findOne({ created_at: { $exists: true, $ne: null } })
        .sort({ created_at: 1 })
        .select("created_at")
        .lean(),
      Borrow.findOne({ created_at: { $exists: true, $ne: null } })
        .sort({ created_at: 1 })
        .select("created_at")
        .lean(),
      Book.aggregate([
        {
          $match: {
            TRANGTHAI: { $ne: "DELETED" },
            TACGIA: { $exists: true, $type: "array", $ne: [] },
          },
        },
        { $unwind: "$TACGIA" },
        {
          $project: {
            code: {
              $toUpper: {
                $trim: {
                  input: { $ifNull: ["$TACGIA", ""] },
                },
              },
            },
          },
        },
        { $match: { code: { $ne: "" } } },
        {
          $group: {
            _id: "$code",
            bookCount: { $sum: 1 },
          },
        },
        { $sort: { bookCount: -1, _id: 1 } },
        { $limit: 6 },
      ]),
    ]);

    const candidateYears = [
      extractYear(earliestBook?.created_at),
      extractYear(earliestReader?.created_at),
      extractYear(earliestBorrow?.created_at),
    ].filter(Boolean);

    const sinceYear = candidateYears.length
      ? Math.min(...candidateYears)
      : currentYear;

    const yearsActive = Math.max(1, currentYear - sinceYear + 1);

    const authorCodes = topAuthorRows.map((row) => normalizeCode(row._id));
    const authorDocs = await Author.find({ MATG: { $in: authorCodes } })
      .select("MATG Hoten TieuSu QuocTich AVATAR_URL")
      .lean();

    const authorMap = new Map(
      authorDocs.map((item) => [normalizeCode(item.MATG), item]),
    );

    const featuredAuthors = topAuthorRows.map((row) => {
      const code = normalizeCode(row._id);
      const author = authorMap.get(code);
      const bio = String(author?.TieuSu || "").trim();

      return {
        code,
        name: String(author?.Hoten || code).trim(),
        nationality: String(author?.QuocTich || "").trim(),
        avatarUrl: String(author?.AVATAR_URL || "").trim(),
        bookCount: Number(row.bookCount || 0),
        bioSnippet: bio ? bio.slice(0, 220) : "",
      };
    });

    return res.status(200).json({
      stats: {
        totalBooks,
        totalReaders,
        totalBorrows,
        sinceYear,
        yearsActive,
      },
      featuredAuthors,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Loi khi lay du lieu trang gioi thieu",
      error: error.message,
    });
  }
};

module.exports = {
  getAboutPageData,
};
