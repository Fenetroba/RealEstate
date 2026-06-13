// routes/support.js

const { Router } = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");
const {
  createTicket, listTickets, getTicket,
  addMessage, updateStatus, unreadCount,
} = require("../controllers/support.controller");

const router = Router();

// Create ticket — works with or without auth
router.post  ("/tickets",              createTicket);

// List tickets — authenticated users see theirs; admins see all
router.get   ("/tickets",              requireAuth, listTickets);
router.get   ("/tickets/:id",          requireAuth, getTicket);
router.post  ("/tickets/:id/messages", requireAuth, addMessage);

// Admin only
router.patch ("/tickets/:id/status",   requireAuth, requireAdmin, updateStatus);
router.get   ("/unread-count",         requireAuth, requireAdmin, unreadCount);

module.exports = router;
