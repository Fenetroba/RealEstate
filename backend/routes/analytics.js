// routes/analytics.js

const { Router } = require("express");
const { requireAuth, requireGovOrAdmin } = require("../middleware/auth.middleware");
const { adminAnalytics, userAnalytics } = require("../controllers/analytics.controller");

const router = Router();

// Admin analytics — requires JWT ADMIN role or gov wallet header
router.get("/admin", requireAuth, requireGovOrAdmin, adminAnalytics);

// User analytics — requires login only
router.get("/user", requireAuth, userAnalytics);

module.exports = router;
