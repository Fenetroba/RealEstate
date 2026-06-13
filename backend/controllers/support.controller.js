// controllers/support.controller.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── POST /api/support/tickets ─────────────────────────────────────────────────
// Create a new support ticket (works for authenticated AND anonymous users)
async function createTicket(req, res) {
  try {
    const { subject, body, guestEmail, guestName } = req.body;
    if (!subject?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    const userId = req.userId ?? null;   // null if unauthenticated

    // For unauthenticated users, require contact info
    if (!userId && !guestEmail?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required for guest tickets." });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        guestEmail: guestEmail?.trim() || null,
        guestName:  guestName?.trim()  || null,
        subject:    subject.trim(),
        messages: {
          create: {
            body:       body.trim(),
            isAdmin:    false,
            senderName: guestName?.trim() || null,
          },
        },
      },
      include: { messages: true },
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    console.error("[createTicket]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/support/tickets ──────────────────────────────────────────────────
// User: their own tickets. Admin: all tickets.
async function listTickets(req, res) {
  try {
    const isAdmin = req.userRole === "ADMIN";
    const { status, page = "1", limit = "20" } = req.query;

    const where = isAdmin
      ? (status ? { status } : {})
      : { userId: req.userId };

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          messages: { orderBy: { createdAt: "asc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip:  (Number(page) - 1) * Number(limit),
        take:  Number(limit),
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return res.json({ success: true, data: tickets, total, page: Number(page) });
  } catch (err) {
    console.error("[listTickets]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/support/tickets/:id ──────────────────────────────────────────────
async function getTicket(req, res) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // Non-admin users can only see their own tickets
    if (req.userRole !== "ADMIN" && ticket.userId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error("[getTicket]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/support/tickets/:id/messages ────────────────────────────────────
async function addMessage(req, res) {
  try {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, message: "Message body is required" });

    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    const isAdmin = req.userRole === "ADMIN";

    // Non-admin can only message their own ticket
    if (!isAdmin && ticket.userId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [message] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId:   ticket.id,
          body:       body.trim(),
          isAdmin,
          senderName: isAdmin ? "Support Team" : null,
        },
      }),
      // Auto-set ticket to IN_PROGRESS when admin replies
      ...(isAdmin && ticket.status === "OPEN"
        ? [prisma.supportTicket.update({
            where: { id: ticket.id },
            data:  { status: "IN_PROGRESS" },
          })]
        : [prisma.supportTicket.update({
            where: { id: ticket.id },
            data:  { updatedAt: new Date() },
          })]),
    ]);

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error("[addMessage]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── PATCH /api/support/tickets/:id/status ─────────────────────────────────────
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const valid = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data:  { status },
    });
    return res.json({ success: true, data: ticket });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/support/unread-count (admin) ─────────────────────────────────────
async function unreadCount(req, res) {
  try {
    const count = await prisma.supportTicket.count({ where: { status: "OPEN" } });
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createTicket, listTickets, getTicket, addMessage, updateStatus, unreadCount };
