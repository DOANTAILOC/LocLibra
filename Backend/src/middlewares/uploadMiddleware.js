const multer = require("multer");

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new Error("Chỉ chấp nhận file ảnh"));
  }

  return cb(null, true);
};

const uploadBookCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single("cover");

module.exports = {
  uploadBookCover,
};
