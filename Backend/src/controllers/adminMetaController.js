const Author = require("../models/Author");
const Genre = require("../models/Genre");
const Staff = require("../models/Staff");
const Publisher = require("../models/Publisher");

const toRegex = (q) => ({ $regex: q, $options: "i" });

const normalizeError = (res, message, error, status = 500) => {
  return res.status(status).json({ message, error: error.message });
};

const getAuthors = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { Hoten: toRegex(q) } : {};
    const items = await Author.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách tác giả", error);
  }
};

const createAuthor = async (req, res) => {
  try {
    const item = await Author.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo tác giả", error, 400);
  }
};

const updateAuthor = async (req, res) => {
  try {
    const item = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật tác giả", error, 400);
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const item = await Author.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy tác giả" });
    }

    return res.status(200).json({ message: "Xóa tác giả thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa tác giả", error);
  }
};

const getGenres = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { name: toRegex(q) } : {};
    const items = await Genre.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách thể loại", error);
  }
};

const createGenre = async (req, res) => {
  try {
    const item = await Genre.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo thể loại", error, 400);
  }
};

const updateGenre = async (req, res) => {
  try {
    const item = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật thể loại", error, 400);
  }
};

const deleteGenre = async (req, res) => {
  try {
    const item = await Genre.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" });
    }

    return res.status(200).json({ message: "Xóa thể loại thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa thể loại", error);
  }
};

const getStaffs = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [
          { HoTenNV: keyword },
          { MSNV: keyword },
          { SoDienThoai: keyword },
        ],
      };
    }

    const items = await Staff.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách nhân viên", error);
  }
};

const createStaff = async (req, res) => {
  try {
    const item = await Staff.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo nhân viên", error, 400);
  }
};

const updateStaff = async (req, res) => {
  try {
    const item = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật nhân viên", error, 400);
  }
};

const deleteStaff = async (req, res) => {
  try {
    const item = await Staff.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    return res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa nhân viên", error);
  }
};

const getPublishers = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MANXB: keyword }, { TENNXB: keyword }, { DIACHI: keyword }],
      };
    }

    const items = await Publisher.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách nhà xuất bản", error);
  }
};

const createPublisher = async (req, res) => {
  try {
    const item = await Publisher.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo nhà xuất bản", error, 400);
  }
};

const updatePublisher = async (req, res) => {
  try {
    const item = await Publisher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return normalizeError(res, "Lỗi khi cập nhật nhà xuất bản", error, 400);
  }
};

const deletePublisher = async (req, res) => {
  try {
    const item = await Publisher.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });
    }

    return res.status(200).json({ message: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi xóa nhà xuất bản", error);
  }
};

module.exports = {
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
};
