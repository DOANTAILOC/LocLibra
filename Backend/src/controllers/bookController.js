const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const Author = require("../models/Author");
const Genre = require("../models/Genre");
const Publisher = require("../models/Publisher");
const cloudinary = require("../config/cloudinary");

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value.map((item) => String(item || "").trim()).filter(Boolean),
      ),
    ];
  }

  if (typeof value === "string") {
    return [
      ...new Set(
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }

  return [];
};

const normalizeCodeArray = (value) => {
  return normalizeStringArray(value).map((item) => item.toUpperCase());
};

const buildAuthorNameMap = async () => {
  const authors = await Author.find({ MATG: { $exists: true, $ne: null } })
    .select("MATG Hoten AVATAR_URL")
    .lean();

  return new Map(
    authors.map((item) => [
      String(item.MATG || "")
        .trim()
        .toUpperCase(),
      {
        name: String(item.Hoten || "").trim(),
        avatarUrl: String(item.AVATAR_URL || "").trim(),
      },
    ]),
  );
};

const buildGenreNameMap = async () => {
  const genres = await Genre.find({ MATL: { $exists: true, $ne: null } })
    .select("MATL name")
    .lean();

  return new Map(
    genres.map((item) => [
      String(item.MATL || "")
        .trim()
        .toUpperCase(),
      String(item.name || "").trim(),
    ]),
  );
};

const buildPublisherNameMap = async () => {
  const publishers = await Publisher.find({
    MANXB: { $exists: true, $ne: null },
  })
    .select("MANXB TENNXB")
    .lean();

  return new Map(
    publishers.map((item) => [
      String(item.MANXB || "")
        .trim()
        .toUpperCase(),
      String(item.TENNXB || "").trim(),
    ]),
  );
};

const enrichBookForResponse = (
  book,
  authorNameMap,
  genreNameMap,
  publisherNameMap,
) => {
  const data = book?.toObject ? book.toObject() : { ...book };
  const authorCodes = normalizeCodeArray(data.TACGIA);
  const genreCodes = normalizeCodeArray(data.THELOAI);
  const publisherCode = String(data.MANXB || "")
    .trim()
    .toUpperCase();

  return {
    ...data,
    TACGIA: authorCodes,
    THELOAI: genreCodes,
    TACGIA_TEN: authorCodes.map(
      (code) => authorNameMap.get(code)?.name || code,
    ),
    TACGIA_CHI_TIET: authorCodes.map((code) => {
      const info = authorNameMap.get(code);
      return {
        code,
        name: info?.name || code,
        avatarUrl: info?.avatarUrl || "",
      };
    }),
    THELOAI_TEN: genreCodes.map((code) => genreNameMap.get(code) || code),
    MANXB_TEN: publisherNameMap.get(publisherCode) || data.MANXB || null,
  };
};

const validateAuthorCodes = async (codes) => {
  if (!codes.length) return;

  const existing = await Author.find({ MATG: { $in: codes } })
    .select("MATG")
    .lean();

  const existingSet = new Set(
    existing.map((item) =>
      String(item.MATG || "")
        .trim()
        .toUpperCase(),
    ),
  );
  const missing = codes.filter((code) => !existingSet.has(code));

  if (missing.length) {
    throw new Error(`Mã tác giả không tồn tại: ${missing.join(", ")}`);
  }
};

const validateGenreCodes = async (codes) => {
  if (!codes.length) return;

  const existing = await Genre.find({ MATL: { $in: codes } })
    .select("MATL")
    .lean();

  const existingSet = new Set(
    existing.map((item) =>
      String(item.MATL || "")
        .trim()
        .toUpperCase(),
    ),
  );
  const missing = codes.filter((code) => !existingSet.has(code));

  if (missing.length) {
    throw new Error(`Mã thể loại không tồn tại: ${missing.join(", ")}`);
  }
};

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const generateNextBookCode = async () => {
  const existing = await Book.find({ MASACH: /^S\d+$/ })
    .select("MASACH")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MASACH).slice(1), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `S${String(maxOrder + 1).padStart(3, "0")}`;
};

const getNextBookCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextBookCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi tạo mã sách kế tiếp", error: error.message });
  }
};

// Tìm kiếm sách theo nhiều tiêu chí
const getBooks = async (req, res) => {
  try {
    const { theloai, tacgia, nhaxuatban, tensach, includeDeleted } = req.query;
    const shouldIncludeDeleted =
      String(includeDeleted).toLowerCase() === "true";
    let filter = shouldIncludeDeleted ? {} : { TRANGTHAI: { $ne: "DELETED" } };
    if (theloai) {
      const genres = normalizeCodeArray(theloai);
      if (genres.length) filter.THELOAI = { $in: genres };
    }
    if (tacgia) {
      const authors = normalizeCodeArray(tacgia);
      if (authors.length) filter.TACGIA = { $in: authors };
    }
    if (nhaxuatban) filter.MANXB = nhaxuatban;
    if (tensach) filter.TENSACH = { $regex: tensach, $options: "i" };

    const [books, authorNameMap, genreNameMap, publisherNameMap] =
      await Promise.all([
        Book.find(filter).sort({ created_at: -1 }),
        buildAuthorNameMap(),
        buildGenreNameMap(),
        buildPublisherNameMap(),
      ]);

    const items = books.map((item) =>
      enrichBookForResponse(
        item,
        authorNameMap,
        genreNameMap,
        publisherNameMap,
      ),
    );

    return res.status(200).json(items);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sách", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const [book, authorNameMap, genreNameMap, publisherNameMap] =
      await Promise.all([
        Book.findOne({
          _id: req.params.id,
          TRANGTHAI: { $ne: "DELETED" },
        }),
        buildAuthorNameMap(),
        buildGenreNameMap(),
        buildPublisherNameMap(),
      ]);

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    return res
      .status(200)
      .json(
        enrichBookForResponse(
          book,
          authorNameMap,
          genreNameMap,
          publisherNameMap,
        ),
      );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin sách", error: error.message });
  }
};

const getBookBorrowStats = async (req, res) => {
  try {
    const rows = await Borrow.aggregate([
      {
        $match: {
          TRANGTHAI: {
            $in: ["APPROVED", "BORROWING", "OVERDUE", "RETURNED", "LOST"],
          },
          MASACH: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$MASACH",
          totalBorrows: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      items: rows.map((item) => ({
        MASACH: String(item._id || "").trim(),
        totalBorrows: Number(item.totalBorrows || 0),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Loi khi lay thong ke luot muon",
      error: error.message,
    });
  }
};

const createBook = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.TACGIA = normalizeCodeArray(payload.TACGIA);
    payload.THELOAI = normalizeCodeArray(payload.THELOAI);
    payload.TRANGTHAI = "ACTIVE";
    payload.DA_XOA_LUC = null;

    await validateAuthorCodes(payload.TACGIA);
    await validateGenreCodes(payload.THELOAI);

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MASACH = await generateNextBookCode();

      try {
        const newBook = await Book.create(payload);
        return res.status(201).json(newBook);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MASACH;

        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã sách tự động" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi khi tạo sách", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const existingBook = await Book.findOne({
      _id: req.params.id,
      TRANGTHAI: { $ne: "DELETED" },
    });
    if (!existingBook) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    const sanitizedPayload = { ...req.body };
    delete sanitizedPayload.MASACH;
    delete sanitizedPayload.TRANGTHAI;
    delete sanitizedPayload.DA_XOA_LUC;
    if (Object.prototype.hasOwnProperty.call(sanitizedPayload, "TACGIA")) {
      sanitizedPayload.TACGIA = normalizeCodeArray(sanitizedPayload.TACGIA);
      await validateAuthorCodes(sanitizedPayload.TACGIA);
    }
    if (Object.prototype.hasOwnProperty.call(sanitizedPayload, "THELOAI")) {
      sanitizedPayload.THELOAI = normalizeCodeArray(sanitizedPayload.THELOAI);
      await validateGenreCodes(sanitizedPayload.THELOAI);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      sanitizedPayload,
      {
        new: true,
        runValidators: true,
      },
    );

    const hasCoverChanged =
      req.body?.ANHBIA_PUBLIC_ID &&
      existingBook.ANHBIA_PUBLIC_ID &&
      req.body.ANHBIA_PUBLIC_ID !== existingBook.ANHBIA_PUBLIC_ID;

    if (hasCoverChanged) {
      cloudinary.uploader
        .destroy(existingBook.ANHBIA_PUBLIC_ID)
        .catch(() => null);
    }

    return res.status(200).json(updatedBook);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi khi cập nhật sách", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findOneAndUpdate(
      {
        _id: req.params.id,
        TRANGTHAI: { $ne: "DELETED" },
      },
      {
        $set: {
          TRANGTHAI: "DELETED",
          DA_XOA_LUC: new Date(),
        },
      },
      { new: true },
    );

    if (!deletedBook) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    return res.status(200).json({
      message: "Đã chuyển sách sang trạng thái đã xóa",
      book: deletedBook,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa sách", error: error.message });
  }
};

const uploadBookCoverImage = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res
        .status(500)
        .json({ message: "Thiếu cấu hình CLOUDINARY_CLOUD_NAME" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh bìa sách" });
    }

    const uploaded = await uploadBufferToCloudinary(
      req.file.buffer,
      "loclibrary/book-covers",
    );

    return res.status(201).json({
      message: "Tải ảnh bìa lên Cloudinary thành công",
      image: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi tải ảnh bìa", error: error.message });
  }
};

module.exports = {
  getNextBookCodePreview,
  getBooks,
  getBookById,
  getBookBorrowStats,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCoverImage,
};
