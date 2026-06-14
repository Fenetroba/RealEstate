// routes/properties.js

const express = require("express");
const router  = express.Router();

const { uploadPropertyFiles } = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  prepareRequest,
  confirmRequest,
  submitUpdateRequest,
  listProperties,
  getProperty,
  getPropertyImages,
  getPropertyDocuments,
  getMyRequests,
  getMyProperties,
  delistProperty,
  listPropertyOnMarket,
} = require("../controllers/properties.controller");

router.post("/request/prepare",       uploadPropertyFiles, prepareRequest);
router.post("/request/confirm",       confirmRequest);
router.get ("/my-requests",           requireAuth, getMyRequests);
router.get ("/mine",                  requireAuth, getMyProperties);
router.post("/:id/delist",            requireAuth, delistProperty);
router.post("/:id/list",              requireAuth, listPropertyOnMarket);
router.post("/:id/update-request",    uploadPropertyFiles, submitUpdateRequest);
router.get ("/",                      listProperties);
router.get ("/:id",                   getProperty);
router.get ("/:id/images",            getPropertyImages);
router.get ("/:id/documents",         getPropertyDocuments);

module.exports = router;
