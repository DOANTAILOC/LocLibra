const Author = require("../models/Author");
const Genre = require("../models/Genre");
const Staff = require("../models/Staff");
const Publisher = require("../models/Publisher");

const toRegex = (q) => ({ $regex: q, $options: "i" });

const generateNextPublisherCode = async () => {
  const existing = await Publisher.find({ MANXB: /^NXB\d+$/i })
    .select("MANXB")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MANXB).replace(/^NXB/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `NXB${String(maxOrder + 1).padStart(3, "0")}`;
};

const generateNextAuthorCode = async () => {
  const existing = await Author.find({ MATG: /^TG\d+$/i })
    .select("MATG")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MATG).replace(/^TG/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `TG${String(maxOrder + 1).padStart(3, "0")}`;
};

const generateNextGenreCode = async () => {
  const existing = await Genre.find({ MATL: /^TL\d+$/i })
    .select("MATL")
    .lean();

  const maxOrder = existing.reduce((max, item) => {
    const order = Number.parseInt(String(item.MATL).replace(/^TL/i, ""), 10);
    if (Number.isNaN(order)) return max;
    return Math.max(max, order);
  }, 0);

  return `TL${String(maxOrder + 1).padStart(3, "0")}`;
};

const normalizeError = (res, message, error, status = 500) => {
  return res.status(status).json({ message, error: error.message });
};

const getAuthors = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MATG: keyword }, { Hoten: keyword }, { QuocTich: keyword }],
      };
    }

    const items = await Author.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách tác giả", error);
  }
};

const getNextAuthorCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextAuthorCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã tác giả kế tiếp", error);
  }
};

const createAuthor = async (req, res) => {
  try {
    const payload = {
      Hoten: req.body?.Hoten,
      TieuSu: req.body?.TieuSu,
      QuocTich: req.body?.QuocTich,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MATG = await generateNextAuthorCode();

      try {
        const item = await Author.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MATG;
        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã tác giả" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo tác giả", error, 400);
  }
};

const updateAuthor = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MATG;

    const item = await Author.findByIdAndUpdate(req.params.id, payload, {
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
    let filter = {};

    if (q) {
      const keyword = toRegex(q);
      filter = {
        $or: [{ MATL: keyword }, { name: keyword }, { description: keyword }],
      };
    }

    const items = await Genre.find(filter).sort({ created_at: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    return normalizeError(res, "Lỗi khi lấy danh sách thể loại", error);
  }
};

const getNextGenreCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextGenreCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã thể loại kế tiếp", error);
  }
};

const createGenre = async (req, res) => {
  try {
    const payload = {
      name: req.body?.name,
      description: req.body?.description,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MATL = await generateNextGenreCode();

      try {
        const item = await Genre.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MATL;
        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã thể loại" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo thể loại", error, 400);
  }
};

const updateGenre = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MATL;

    const item = await Genre.findByIdAndUpdate(req.params.id, payload, {
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

const getNextPublisherCodePreview = async (req, res) => {
  try {
    const nextCode = await generateNextPublisherCode();
    return res.status(200).json({ nextCode });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo mã nhà xuất bản kế tiếp", error);
  }
};

const createPublisher = async (req, res) => {
  try {
    const payload = {
      TENNXB: req.body?.TENNXB,
      DIACHI: req.body?.DIACHI,
    };

    for (let retry = 0; retry < 3; retry += 1) {
      payload.MANXB = await generateNextPublisherCode();

      try {
        const item = await Publisher.create(payload);
        return res.status(201).json(item);
      } catch (error) {
        const isDuplicateCode =
          error?.code === 11000 && error?.keyPattern?.MANXB;

        if (!isDuplicateCode || retry === 2) {
          throw error;
        }
      }
    }

    return res.status(500).json({ message: "Không thể tạo mã nhà xuất bản" });
  } catch (error) {
    return normalizeError(res, "Lỗi khi tạo nhà xuất bản", error, 400);
  }
};

const updatePublisher = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.MANXB;

    const item = await Publisher.findByIdAndUpdate(req.params.id, payload, {
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
};
