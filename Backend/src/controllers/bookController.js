const Book = require("../models/Book");

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ created_at: -1 });
    return res.status(200).json(books);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sách", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

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
    const newBook = await Book.create(req.body);
    return res.status(201).json(newBook);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi khi tạo sách", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
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
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    return res.status(200).json({ message: "Xóa sách thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa sách", error: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
