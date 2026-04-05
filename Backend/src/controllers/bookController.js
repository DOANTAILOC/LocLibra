const Book = require("../models/Book");
const cloudinary = require("../config/cloudinary");

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

// Tìm kiếm sách theo nhiều tiêu chí
const getBooks = async (req, res) => {
  try {
    const { theloai, tacgia, nhaxuatban, tensach, includeDeleted } = req.query;
    const shouldIncludeDeleted =
      String(includeDeleted).toLowerCase() === "true";
    let filter = shouldIncludeDeleted ? {} : { TRANGTHAI: { $ne: "DELETED" } };
    if (theloai) filter.THELOAI = theloai;
    if (tacgia) filter.TACGIA = tacgia;
    if (nhaxuatban) filter.MANXB = nhaxuatban;
    if (tensach) filter.TENSACH = { $regex: tensach, $options: "i" };

    const books = await Book.find(filter).sort({ created_at: -1 });
    return res.status(200).json(books);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sách", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      TRANGTHAI: { $ne: "DELETED" },
    });

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin sách", error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.TRANGTHAI = "ACTIVE";
    payload.DA_XOA_LUC = null;

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
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCoverImage,
};
