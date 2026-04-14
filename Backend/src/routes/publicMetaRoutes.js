const express = require("express");
const { getAboutPageData } = require("../controllers/publicMetaController");

const router = express.Router();

router.get("/about", getAboutPageData);

module.exports = router;
