// routes/kyc.js

const express = require("express");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth.middleware");
const { uploadKycDocs } = require("../middleware/uploadKyc");
const {
  submitKyc,
  getKycStatus,
  listSubmissions,
  approveKyc,
  rejectKyc,
  getKycDocument,
} = require("../controllers/kyc.controller");

// ── User routes (require login) ───────────────────────────────────────────────
router.post("/submit",  requireAuth, uploadKycDocs, submitKyc);
router.get ("/status",  requireAuth, getKycStatus);

// ── Admin routes (require login + ADMIN role) ─────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

router.get ("/admin/submissions",              requireAuth, requireAdmin, listSubmissions);
router.post("/admin/:submissionId/approve",    requireAuth, requireAdmin, approveKyc);
router.post("/admin/:submissionId/reject",     requireAuth, requireAdmin, rejectKyc);
router.get ("/admin/document/:documentId",     requireAuth, requireAdmin, getKycDocument);

module.exports = router;
