// routes/admin.js

const express = require("express");
const router  = express.Router();

const { requireGov, requireAuth } = require("../middleware/auth.middleware");
const {
  listRequests,
  listDbRequests,
  getRequestDocumentImage,
  approveRequest,
  declineRequest,
} = require("../controllers/admin.controller");

// ── Middleware: accept either gov-wallet (on-chain flow) or JWT admin (DB flow) ──
function requireGovOrAdmin(req, res, next) {
  const govWallet = req.headers["x-gov-wallet"];

  // Gov-wallet path (existing blockchain flow)
  if (govWallet) {
    if (govWallet.toLowerCase() !== process.env.GOV_WALLET?.toLowerCase()) {
      return res.status(403).json({ error: "Not authorized: wallet is not the government wallet" });
    }
    req.govWallet = govWallet.toLowerCase();
    return next();
  }

  // JWT admin path (DB-only flow)
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing x-gov-wallet header or Bearer token" });
  }
  const jwt = require("jsonwebtoken");
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_change_me";
  try {
    const payload = jwt.verify(header.slice(7), ACCESS_SECRET);
    if (payload.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin role required" });
    }
    req.userId   = payload.sub;
    req.userRole = payload.role;
    req.govWallet = process.env.GOV_WALLET?.toLowerCase() || "admin";
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── DB-backed routes (JWT auth) ───────────────────────────────────────────────
router.get ("/db-requests",                        requireAuth, listDbRequests);
router.get ("/db-requests/any/image/:documentId",  requireAuth, getRequestDocumentImage);

// ── Approve / decline — accept gov-wallet OR JWT admin ────────────────────────
router.post("/approve/:requestId",    requireGovOrAdmin, approveRequest);
router.post("/decline/:requestId",    requireGovOrAdmin, declineRequest);

// ── Gov-wallet only routes (on-chain request list) ────────────────────────────
router.get ("/requests",              requireGov, listRequests);

module.exports = router;
