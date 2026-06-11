// routes/notifications.js

const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notifications.controller");

const router = Router();

// All notification routes require a logged-in user
router.use(requireAuth);

router.get("/",                  listNotifications);
router.get("/unread-count",      unreadCount);
router.put("/read-all",          markAllRead);
router.put("/:id/read",          markRead);
router.delete("/:id",            deleteNotification);

module.exports = router;
