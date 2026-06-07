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
} = require("../controllers/auth.controller");

function requireAdmin(req, res, next) {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

router.post("/register",        register);
router.post("/login",           login);
router.post("/logout",          requireAuth, logout);
router.post("/refresh",         refresh);
router.get ("/me",              requireAuth, getMe);
router.put ("/profile",         requireAuth, updateProfile);
router.post("/connect-wallet",  requireAuth, connectWallet);
router.get ("/admin/users",     requireAuth, requireAdmin, adminListUsers);

module.exports = router;
