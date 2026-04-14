const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const bookRoutes = require("./src/routes/bookRoutes");
const authRoutes = require("./src/routes/authRoutes");
const borrowRoutes = require("./src/routes/borrowRoutes");
const voteRoutes = require("./src/routes/voteRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const publicMetaRoutes = require("./src/routes/publicMetaRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", publicMetaRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Library API is running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
