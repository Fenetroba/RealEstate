// controllers/kyc.controller.js
// KYC identity document submission and admin review

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FIELD_TO_KIND = {
  id_front: "ID_FRONT",
  id_back:  "ID_BACK",
  selfie:   "SELFIE",
};

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ── User: submit KYC documents ────────────────────────────────────────────────
/**
 * POST /api/kyc/submit
 * Multipart: id_front, id_back, selfie (all required)
 */
async function submitKyc(req, res) {
  try {
    const userId = req.userId;
    const files  = req.files || {};

    // Validate all three fields are present
    const missing = ["id_front", "id_back", "selfie"].filter((f) => !files[f]?.[0]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required files: ${missing.join(", ")}`,
      });
    }

    // Block if there's already a PENDING or APPROVED submission
    const existing = await prisma.kycSubmission.findFirst({
      where: { userId, status: { in: ["PENDING", "APPROVED"] } },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          existing.status === "APPROVED"
            ? "Your identity is already verified."
            : "You already have a pending submission. Wait for admin review.",
      });
    }

    // Create submission + documents in one transaction
    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.kycSubmission.create({
        data: { userId, status: "PENDING" },
      });

      for (const [field, kind] of Object.entries(FIELD_TO_KIND)) {
        const file = files[field]?.[0];
        if (!file) continue;
        await tx.kycDocument.create({
          data: {
            submissionId: sub.id,
            kind,
            fileData:  file.buffer,
            sha256Hash: sha256(file.buffer),
            fileName:  file.originalname,
            mimeType:  file.mimetype,
            sizeBytes: file.size,
          },
        });
      }

      return sub;
    });

    return res.status(201).json({
      success: true,
      data: {
        submissionId: submission.id,
        status:       submission.status,
        message:      "Submitted for admin review.",
      },
    });
  } catch (err) {
    console.error("[submitKyc]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── User: get my KYC status ───────────────────────────────────────────────────
/**
 * GET /api/kyc/status
 */
async function getKycStatus(req, res) {
  try {
    const submission = await prisma.kycSubmission.findFirst({
      where:   { userId: req.userId },
      orderBy: { submittedAt: "desc" },
      include: {
        documents: {
          select: {
            id: true, kind: true, fileName: true,
            mimeType: true, sizeBytes: true, createdAt: true,
          },
        },
      },
    });

    if (!submission) {
      return res.json({ success: true, data: null });
    }

    const { fileData: _omit, ...safe } = submission;
    return res.json({
      success: true,
      data: {
        id:           submission.id,
        status:       submission.status,
        submittedAt:  submission.submittedAt,
        reviewedAt:   submission.reviewedAt,
        rejectReason: submission.rejectReason,
        documents:    submission.documents,
      },
    });
  } catch (err) {
    console.error("[getKycStatus]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Admin: list all KYC submissions ──────────────────────────────────────────
/**
 * GET /api/kyc/admin/submissions?status=PENDING
 */
async function listSubmissions(req, res) {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const submissions = await prisma.kycSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, email: true,
            first_name: true, last_name: true,
          },
        },
        documents: {
          select: {
            id: true, kind: true, fileName: true,
            mimeType: true, sizeBytes: true, createdAt: true,
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    return res.json({ success: true, data: submissions });
  } catch (err) {
    console.error("[listSubmissions]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Admin: approve KYC ────────────────────────────────────────────────────────
/**
 * POST /api/kyc/admin/:submissionId/approve
 */
async function approveKyc(req, res) {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.kycSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (submission.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Submission is already ${submission.status}`,
      });
    }

    await prisma.$transaction([
      prisma.kycSubmission.update({
        where: { id: submissionId },
        data: {
          status:     "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: req.userId,
        },
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data:  { isVerified: true },
      }),
    ]);

    return res.json({ success: true, data: { message: "KYC approved" } });
  } catch (err) {
    console.error("[approveKyc]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Admin: reject KYC ─────────────────────────────────────────────────────────
/**
 * POST /api/kyc/admin/:submissionId/reject
 * Body: { reason: string }
 */
async function rejectKyc(req, res) {
  try {
    const { submissionId } = req.params;
    const { reason }       = req.body;

    const submission = await prisma.kycSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    if (submission.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Submission is already ${submission.status}`,
      });
    }

    await prisma.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status:       "REJECTED",
        reviewedAt:   new Date(),
        reviewedBy:   req.userId,
        rejectReason: reason || null,
      },
    });

    return res.json({ success: true, data: { message: "KYC rejected" } });
  } catch (err) {
    console.error("[rejectKyc]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Admin: get a document image (for review) ──────────────────────────────────
/**
 * GET /api/kyc/admin/document/:documentId
 * Returns the raw image bytes with correct Content-Type
 */
async function getKycDocument(req, res) {
  try {
    const doc = await prisma.kycDocument.findUnique({
      where: { id: req.params.documentId },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    res.set("Content-Type", doc.mimeType);
    res.set("Content-Disposition", `inline; filename="${doc.fileName}"`);
    return res.send(doc.fileData);
  } catch (err) {
    console.error("[getKycDocument]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  submitKyc,
  getKycStatus,
  listSubmissions,
  approveKyc,
  rejectKyc,
  getKycDocument,
};
