// controllers/notifications.controller.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── Helper: create a notification ────────────────────────────────────────────
async function createNotification({ userId, type, title, message, link = null }) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

// ── GET /api/notifications ────────────────────────────────────────────────────
async function listNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("[listNotifications]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/notifications/unread-count ───────────────────────────────────────
async function unreadCount(req, res) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
async function markRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data:  { isRead: true },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
async function markAllRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data:  { isRead: true },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
async function deleteNotification(req, res) {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createNotification,
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
};
