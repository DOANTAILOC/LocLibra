const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bookRoutes = require("./Backend/src/routes/bookRoutes");
const authRoutes = require("./Backend/src/routes/authRoutes");
const borrowRoutes = require("./Backend/src/routes/borrowRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/borrows", borrowRoutes);

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
