// middleware/auth.middleware.js
// Shared auth middleware used by routes

const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_change_me";

/**
 * requireAuth — validates Bearer access token, attaches req.userId + req.userRole
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.userId   = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * requireGov — checks x-gov-wallet header matches GOV_WALLET in .env
 */
function requireGov(req, res, next) {
  const wallet = req.headers["x-gov-wallet"];
  if (!wallet) {
    return res.status(401).json({ error: "Missing x-gov-wallet header" });
  }
  if (wallet.toLowerCase() !== process.env.GOV_WALLET?.toLowerCase()) {
    return res.status(403).json({ error: "Not authorized: wallet is not the government wallet" });
  }
  req.govWallet = wallet.toLowerCase();
  next();
}

module.exports = { requireAuth, requireGov };
