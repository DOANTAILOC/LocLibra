const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Reader = require("./src/models/Reader");
const Staff = require("./src/models/Staff");
const Book = require("./src/models/Book");
const Borrow = require("./src/models/Borrow");
const Publisher = require("./src/models/Publisher");
const Vote = require("./src/models/Vote");

const readers = [
  {
    MADOCGIA: "DG001",
    HOLOT: "Nguyễn Văn",
    TEN: "An",
    NGAYSINH: new Date("2003-05-12"),
    PHAI: "Nam",
    DIACHI: "Ninh Kiều, Cần Thơ",
    DIENTHOAI: "0901000001",
  },
  {
    MADOCGIA: "DG002",
    HOLOT: "Trần Thị",
    TEN: "Bình",
    NGAYSINH: new Date("2004-09-08"),
    PHAI: "Nữ",
    DIACHI: "Bình Thủy, Cần Thơ",
    DIENTHOAI: "0901000002",
  },
  {
    MADOCGIA: "DG003",
    HOLOT: "Lê Quốc",
    TEN: "Cường",
    NGAYSINH: new Date("2002-11-21"),
    PHAI: "Nam",
    DIACHI: "Ô Môn, Cần Thơ",
    DIENTHOAI: "0901000003",
  },
];

const staffs = [
  {
    MSNV: "NV001",
    HoTenNV: "Ngô Thị Thư",
    Password: "123456",
    ChucVu: "Thủ thư",
    DiaChi: "Ninh Kiều, Cần Thơ",
    SoDienThoai: "0912000001",
  },
];

const publishers = [
  {
    MANXB: "NXB001",
    TENNXB: "Nhà xuất bản Trẻ",
    DIACHI: "TP. Hồ Chí Minh",
  },
  {
    MANXB: "NXB002",
    TENNXB: "Nhà xuất bản Giáo dục Việt Nam",
    DIACHI: "Hà Nội",
  },
];

const books = [
  {
    MASACH: "S001",
    TENSACH: "Lập trình JavaScript cơ bản",
    MOTA_NGAN: "Giới thiệu nền tảng JavaScript cho người mới bắt đầu.",
    DONGIA: 85000,
    SOQUYEN: 12,
    NAMXUATBAN: 2022,
    MANXB: "NXB001",
    TACGIA: "Nguyễn Minh Hoàng",
    THELOAI: "Công nghệ thông tin",
  },
  {
    MASACH: "S002",
    TENSACH: "Cấu trúc dữ liệu và giải thuật",
    MOTA_NGAN: "Tổng quan cấu trúc dữ liệu và kỹ thuật giải bài toán hiệu quả.",
    DONGIA: 120000,
    SOQUYEN: 8,
    NAMXUATBAN: 2021,
    MANXB: "NXB002",
    TACGIA: "Trần Quốc Huy",
    THELOAI: "Giáo trình",
  },
  {
    MASACH: "S003",
    TENSACH: "Thiết kế cơ sở dữ liệu",
    MOTA_NGAN: "Hướng dẫn thiết kế database quan hệ theo chuẩn thực tế.",
    DONGIA: 99000,
    SOQUYEN: 10,
    NAMXUATBAN: 2020,
    MANXB: "NXB001",
    TACGIA: "Lê Thu Hà",
    THELOAI: "Công nghệ thông tin",
  },
  {
    MASACH: "S004",
    TENSACH: "Node.js Thực Chiến",
    MOTA_NGAN:
      "Xây dựng API và ứng dụng backend với Node.js từ cơ bản đến nâng cao.",
    DONGIA: 135000,
    SOQUYEN: 9,
    NAMXUATBAN: 2023,
    MANXB: "NXB001",
    TACGIA: "Phạm Thanh Nam",
    THELOAI: "Công nghệ thông tin",
  },
  {
    MASACH: "S005",
    TENSACH: "Python Cho Người Mới",
    MOTA_NGAN: "Nhập môn Python với ví dụ thực tế và bài tập ứng dụng.",
    DONGIA: 98000,
    SOQUYEN: 15,
    NAMXUATBAN: 2022,
    MANXB: "NXB002",
    TACGIA: "Đỗ Minh Tâm",
    THELOAI: "Giáo trình",
  },
  {
    MASACH: "S006",
    TENSACH: "Học Máy Cơ Bản",
    MOTA_NGAN:
      "Giải thích các thuật toán machine learning phổ biến bằng ngôn ngữ dễ hiểu.",
    DONGIA: 175000,
    SOQUYEN: 6,
    NAMXUATBAN: 2024,
    MANXB: "NXB001",
    TACGIA: "Ngô Gia Bảo",
    THELOAI: "Khoa học dữ liệu",
  },
  {
    MASACH: "S007",
    TENSACH: "Thiết Kế UI/UX Hiện Đại",
    MOTA_NGAN:
      "Nguyên tắc thiết kế giao diện và trải nghiệm người dùng cho sản phẩm số.",
    DONGIA: 145000,
    SOQUYEN: 11,
    NAMXUATBAN: 2021,
    MANXB: "NXB002",
    TACGIA: "Trần Khánh Vy",
    THELOAI: "Thiết kế",
  },
  {
    MASACH: "S008",
    TENSACH: "Mạng Máy Tính Căn Bản",
    MOTA_NGAN:
      "Kiến thức nền tảng về giao thức mạng và mô hình kết nối hiện đại.",
    DONGIA: 110000,
    SOQUYEN: 7,
    NAMXUATBAN: 2020,
    MANXB: "NXB001",
    TACGIA: "Lê Quang Huy",
    THELOAI: "Công nghệ thông tin",
  },
  {
    MASACH: "S009",
    TENSACH: "Kỹ Năng Quản Lý Thời Gian",
    MOTA_NGAN:
      "Phương pháp quản trị thời gian giúp nâng cao hiệu suất học tập và công việc.",
    DONGIA: 76000,
    SOQUYEN: 20,
    NAMXUATBAN: 2019,
    MANXB: "NXB002",
    TACGIA: "Nguyễn Thùy Linh",
    THELOAI: "Kỹ năng sống",
  },
  {
    MASACH: "S010",
    TENSACH: "Tâm Lý Học Hành Vi",
    MOTA_NGAN:
      "Khám phá cách con người ra quyết định trong đời sống và tài chính.",
    DONGIA: 128000,
    SOQUYEN: 10,
    NAMXUATBAN: 2022,
    MANXB: "NXB001",
    TACGIA: "Phan Hữu Đức",
    THELOAI: "Tâm lý",
  },
  {
    MASACH: "S011",
    TENSACH: "Lịch Sử Việt Nam Tóm Lược",
    MOTA_NGAN:
      "Tổng quan các giai đoạn lịch sử Việt Nam qua góc nhìn dễ tiếp cận.",
    DONGIA: 89000,
    SOQUYEN: 13,
    NAMXUATBAN: 2018,
    MANXB: "NXB002",
    TACGIA: "Bùi Quốc Anh",
    THELOAI: "Lịch sử",
  },
  {
    MASACH: "S012",
    TENSACH: "Toán Rời Rạc Ứng Dụng",
    MOTA_NGAN: "Kiến thức toán rời rạc phục vụ lập trình và khoa học máy tính.",
    DONGIA: 102000,
    SOQUYEN: 8,
    NAMXUATBAN: 2021,
    MANXB: "NXB001",
    TACGIA: "Võ Thành Công",
    THELOAI: "Giáo trình",
  },
  {
    MASACH: "S013",
    TENSACH: "Khởi Nghiệp Tinh Gọn",
    MOTA_NGAN:
      "Tư duy Lean Startup và cách kiểm chứng ý tưởng kinh doanh hiệu quả.",
    DONGIA: 119000,
    SOQUYEN: 14,
    NAMXUATBAN: 2023,
    MANXB: "NXB002",
    TACGIA: "Hoàng Minh Trí",
    THELOAI: "Kinh doanh",
  },
];

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  await Promise.all([
    Vote.deleteMany({}),
    Borrow.deleteMany({}),
    Book.deleteMany({}),
    Reader.deleteMany({}),
    Staff.deleteMany({}),
    Publisher.deleteMany({}),
  ]);

  await Reader.insertMany(readers);
  await Staff.create(staffs);
  await Publisher.insertMany(publishers);
  await Book.insertMany(books);

  const borrows = [
    {
      MADOCGIA: "DG001",
      MASACH: "S001",
      MSNV: "NV001",
      NGAYMUON: new Date("2026-03-01T09:00:00.000Z"),
      NGAYTRA: new Date("2026-03-10T09:00:00.000Z"),
    },
    {
      MADOCGIA: "DG002",
      MASACH: "S002",
      MSNV: "NV001",
      NGAYMUON: new Date("2026-03-12T09:00:00.000Z"),
      NGAYTRA: null,
    },
  ];

  await Borrow.insertMany(borrows);

  console.log(
    "Seed completed: readers, staffs, publishers, books, borrows, votes",
  );
}

seedDatabase()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  });
