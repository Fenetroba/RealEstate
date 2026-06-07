// routes/verify.js

const express = require("express");
const router  = express.Router();

const { verifyProperty } = require("../controllers/verify.controller");

router.get("/:tokenId", verifyProperty);

module.exports = router;
