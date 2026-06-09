// controllers/admin.controller.js

const { PrismaClient } = require("@prisma/client");
const { mintPropertyOnChain, approveUpdateOnChain, getPropertyNFT } = require("../utils/contract");

const prisma = new PrismaClient();

/**
 * GET /api/admin/requests
 * Query: ?status=PENDING|APPROVED|DECLINED&type=MINT|UPDATE
 */
async function listRequests(req, res) {
  try {
    const { status = "PENDING", type } = req.query;
    const where = { status };
    if (type) where.type = type;

    const requests = await prisma.request.findMany({
      where,
      include: {
        property: {
          select: { id: true, tokenId: true, name: true, location: true, ownerWallet: true },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    return res.json(requests);
  } catch (err) {
    console.error("[listRequests]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/admin/db-requests
 * Full property + documents for admin review — no blockchain required.
 * Query: ?status=PENDING|APPROVED|DECLINED&type=MINT|UPDATE
 */
async function listDbRequests(req, res) {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type)   where.type   = type;

    const requests = await prisma.request.findMany({
      where,
      include: {
        property: {
          include: {
            documents: {
              select: {
                id: true, fileType: true, fileName: true,
                mimeType: true, sizeBytes: true, sha256Hash: true,
                versionNo: true, docType: true, createdAt: true,
                uploadedBy: true, isDuplicate: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("[listDbRequests]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/admin/db-requests/:requestId/image/:documentId
 * Stream a single image for admin preview (requires auth, not gov wallet)
 */
async function getRequestDocumentImage(req, res) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.documentId },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    res.set("Content-Type", doc.mimeType);
    res.set("Content-Disposition", `inline; filename="${doc.fileName}"`);
    return res.send(doc.fileData);
  } catch (err) {
    console.error("[getRequestDocumentImage]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/admin/approve/:requestId
 */
async function approveRequest(req, res) {
  const { requestId } = req.params;
  const { onChainRequestId } = req.body;

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { property: true },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    const { metadataHash, imagesRootHash, documentsRootHash } = request;

    // ── MINT ──────────────────────────────────────────────────────────────────
    if (request.type === "MINT") {
      // If onChainRequestId provided, attempt blockchain mint; otherwise DB-only approval
      let mintedTokenId = onChainRequestId?.toString() ?? `db_${Date.now()}`;
      let txHash = null;

      if (onChainRequestId !== undefined && onChainRequestId !== null) {
        try {
          const receipt = await mintPropertyOnChain(onChainRequestId);
          txHash = receipt.transactionHash;
          try {
            const approvedEvent = receipt.events?.find((e) => e.event === "RequestApproved");
            if (approvedEvent) mintedTokenId = approvedEvent.args.propertyId.toString();
          } catch (_) {}
        } catch (chainErr) {
          console.warn("[chain] mintProperty failed, doing DB-only approval:", chainErr.message);
          // Continue with DB-only approval
        }
      }

      await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: {
            status:     "APPROVED",
            reviewedBy: req.govWallet || "admin",
            reviewedAt: new Date(),
          },
        }),
        prisma.property.update({
          where: { id: request.propertyId },
          data: { tokenId: mintedTokenId, status: "MINTED", chainHash: metadataHash },
        }),
        prisma.metadataVersion.create({
          data: {
            propertyId:       request.propertyId,
            versionNo:        1,
            metadataHash,
            imagesRootHash,
            documentsRootHash,
            metadataSnapshot: request.metadataSnapshot,
            approvedBy:       req.govWallet || "admin",
          },
        }),
      ]);

      return res.json({
        success: true,
        message: "Mint request approved and property published",
        tokenId: mintedTokenId,
        txHash,
      });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (request.type === "UPDATE") {
      const property = request.property;
      if (!property || property.status !== "MINTED") {
        return res.status(400).json({ error: "Property is not minted yet" });
      }

      const lastVersion = await prisma.metadataVersion.findFirst({
        where: { propertyId: request.propertyId },
        orderBy: { versionNo: "desc" },
      });
      const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

      let txHash = null;
      // Try on-chain, fall back to DB-only
      try {
        const onChainUpdates = await getPropertyNFT().getUpdateRequests(property.tokenId);
        let pendingIndex = onChainUpdates.findIndex((u) => Number(u.status) === 0);
        if (pendingIndex !== -1) {
          const receipt = await approveUpdateOnChain(property.tokenId, pendingIndex);
          txHash = receipt.transactionHash;
        }
      } catch (chainErr) {
        console.warn("[chain] approveUpdateRequest failed, doing DB-only:", chainErr.message);
      }

      await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: {
            status:     "APPROVED",
            reviewedBy: req.govWallet || "admin",
            reviewedAt: new Date(),
          },
        }),
        prisma.property.update({
          where: { id: request.propertyId },
          data: {
            metadataHash, imagesRootHash, documentsRootHash,
            chainHash:    metadataHash,
            name:         request.metadataSnapshot.name,
            location:     request.metadataSnapshot.location,
            propertyType: request.metadataSnapshot.propertyType,
            bedrooms:     request.metadataSnapshot.bedrooms,
            bathrooms:    request.metadataSnapshot.bathrooms,
            squareFeet:   request.metadataSnapshot.squareFeet,
            price:        request.metadataSnapshot.price,
          },
        }),
        prisma.metadataVersion.create({
          data: {
            propertyId:       request.propertyId,
            versionNo:        newVersionNo,
            metadataHash,
            imagesRootHash,
            documentsRootHash,
            metadataSnapshot: request.metadataSnapshot,
            approvedBy:       req.govWallet || "admin",
          },
        }),
      ]);

      return res.json({
        success: true,
        message: "Update request approved",
        newVersion: newVersionNo,
        txHash,
      });
    }

    return res.status(400).json({ error: "Unknown request type" });
  } catch (err) {
    console.error("[approveRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/admin/decline/:requestId
 */
async function declineRequest(req, res) {
  const { requestId } = req.params;
  const { reason } = req.body;

  try {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: {
          status:        "DECLINED",
          reviewedBy:    req.govWallet || "admin",
          reviewedAt:    new Date(),
          declineReason: reason || null,
        },
      }),
      ...(request.type === "MINT" && request.propertyId
        ? [prisma.property.update({
            where: { id: request.propertyId },
            data:  { status: "DECLINED" },
          })]
        : []),
    ]);

    return res.json({ success: true, message: "Request declined", requestId, reason });
  } catch (err) {
    console.error("[declineRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { listRequests, listDbRequests, getRequestDocumentImage, approveRequest, declineRequest };

