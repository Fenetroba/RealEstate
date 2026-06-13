// routes/auth.js

const express = require("express");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth.middleware");
const {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateProfile,
  connectWallet,
  adminListUsers,
  verifyPassword,
} = require("../controllers/auth.controller");

function requireAdmin(req, res, next) {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

const passport = require("passport");
const { handleGoogleCallback } = require("../utils/google-auth");

router.post("/register",        register);
router.post("/login",           login);
router.post("/logout",          requireAuth, logout);
router.post("/refresh",         refresh);
router.get ("/me",              requireAuth, getMe);
router.put ("/profile",         requireAuth, updateProfile);
router.post("/connect-wallet",  requireAuth, connectWallet);
router.post("/verify-password", requireAuth, verifyPassword);
router.get ("/admin/users",     requireAuth, requireAdmin, adminListUsers);

// ── Google OAuth ──────────────────────────────────────────────────────────────

// Guard against double-invocation: OAuth codes are single-use.
// Browser prefetch or double-clicks can cause a second exchange attempt.
const _usedCodes = new Set();

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);

router.get("/google/callback",
  (req, res, next) => {
    const code = req.query.code;

    // If no code, let passport handle the error
    if (!code) return next();

    // Reject already-used codes immediately
    if (_usedCodes.has(code)) {
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/auth/login?error=google_code_reused`);
    }

    // Mark code as used before passport exchanges it
    _usedCodes.add(code);
    // Clean up after 5 minutes to avoid memory growth
    setTimeout(() => _usedCodes.delete(code), 5 * 60 * 1000);

    next();
  },
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000"}/auth/login?error=google_failed`,
      session: false,
    })(req, res, (err) => {
      if (err) {
        // Catch invalid_grant and other OAuth errors cleanly instead of crashing
        console.warn("[google-auth] OAuth error:", err.code || err.message);
        const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/auth/login?error=google_failed`);
      }
      next();
    });
  },
  handleGoogleCallback,
);

module.exports = router;
