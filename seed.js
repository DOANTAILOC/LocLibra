const mongoose = require("mongoose");
require("dotenv").config();

const Reader = require("./Backend/src/models/Reader");
const Staff = require("./Backend/src/models/Staff");
const Book = require("./Backend/src/models/Book");
const Borrow = require("./Backend/src/models/Borrow");
const Publisher = require("./Backend/src/models/Publisher");

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
    DONGIA: 99000,
    SOQUYEN: 10,
    NAMXUATBAN: 2020,
    MANXB: "NXB001",
    TACGIA: "Lê Thu Hà",
    THELOAI: "Công nghệ thông tin",
  },
];

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  await Promise.all([
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

  console.log("Seed completed: readers, staffs, publishers, books, borrows");
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
