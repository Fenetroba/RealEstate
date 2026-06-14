// controllers/admin.controller.js

const { PrismaClient } = require("@prisma/client");
const { approveUpdateOnChain, getPropertyNFT, resetSignerSingleton } = require("../utils/contract");
const { createNotification } = require("./notifications.controller");

const prisma = new PrismaClient();

// ── Notify the user who submitted the request ─────────────────────────────────
async function notifyUser(submittedBy, type, title, message, link) {
  try {
    let userId = null;
    if (submittedBy.startsWith("user:")) {
      userId = submittedBy.replace("user:", "");
    } else {
      const user = await prisma.user.findFirst({
        where: { walletAddress: submittedBy },
        select: { id: true },
      });
      userId = user?.id ?? null;
    }
    if (userId) {
      await createNotification({ userId, type, title, message, link });
    }
  } catch (err) {
    console.warn("[notify] Failed to create notification:", err.message);
  }
}

// ── Extract minted tokenId from RequestApproved event logs ───────────────────
// RequestApproved(uint256 indexed requestId, uint256 propertyId)
// requestId is the first indexed topic; propertyId is in the non-indexed data field.
function extractMintedTokenId(receipt) {
  try {
    for (const log of receipt.logs ?? []) {
      // Must have at least 2 topics (event sig + indexed requestId)
      // data encodes the non-indexed propertyId (uint256)
      if (log.topics && log.topics.length >= 2 && log.data && log.data !== "0x") {
        const tokenId = BigInt(log.data).toString();
        // tokenId 0 is valid — it's the first minted NFT on a fresh Hardhat node
        return tokenId;
      }
    }
  } catch (_) {}
  return null;
}

// ── GET /api/admin/requests ───────────────────────────────────────────────────
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

// ── GET /api/admin/db-requests ────────────────────────────────────────────────
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

// ── GET /api/admin/db-requests/:requestId/image/:documentId ─────────────────
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

// ── POST /api/admin/approve/:requestId ───────────────────────────────────────
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
      let mintedTokenId = `db_${Date.now()}`;
      let txHash = null;

      const onChainReqId = request.onChainRequestId ?? onChainRequestId ?? null;

      if (
        onChainReqId !== null &&
        onChainReqId !== undefined &&
        process.env.PROPERTY_NFT_ADDRESS &&
        process.env.PROPERTY_NFT_ADDRESS !== "0xYourContractAddressHere"
      ) {
        try {
          const nftContract = getPropertyNFT();

          // Check on-chain request status before trying to approve.
          // If already Approved (1) or Declined (2), extract the propertyId
          // from the existing approval event instead of calling approveRequest again.
          let skipChainCall = false;
          try {
            const onChainReq = await nftContract.requests(BigInt(onChainReqId));
            // RealEstate.sol RequestStatus: 0=Pending, 1=Approved, 2=Declined
            const chainStatus = Number(onChainReq.status ?? onChainReq[3] ?? 0);
            if (chainStatus !== 0) {
              console.log(`[chain] Request ${onChainReqId} already has status ${chainStatus} on-chain — skipping approveRequest call`);
              skipChainCall = true;
              // If already approved, try to get the minted propertyId from the property mapping
              // The NFT token for this requester was already minted at some point
              // Use the total properties count to find the last minted token
              try {
                const total = await nftContract.getTotalProperties();
                // The token that was minted for this request should be findable
                // by checking ownership history — use total-1 as best guess for the tokenId
                if (Number(total) > 0) {
                  mintedTokenId = String(Number(total) - 1);
                }
              } catch (_) {}
            }
          } catch (_) {
            // Could not read request status — proceed with normal approval attempt
          }

          if (!skipChainCall) {
            const approveTx = await nftContract.approveRequest(BigInt(onChainReqId));
            const approveReceipt = await approveTx.wait();
            txHash = approveReceipt.transactionHash ?? approveReceipt.hash ?? null;
            const extracted = extractMintedTokenId(approveReceipt);
            if (extracted) mintedTokenId = extracted;
            console.log(`[chain] Minted NFT tokenId=${mintedTokenId} txHash=${txHash}`);
          }
        } catch (chainErr) {
          console.warn("[chain] approveRequest on-chain failed, DB-only:", chainErr.message);
          resetSignerSingleton();
          mintedTokenId = `db_${Date.now()}`;
        }
      } else {
        console.log("[chain] No onChainRequestId — DB-only approval");
      }

      await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: { status: "APPROVED", reviewedBy: req.govWallet || "admin", reviewedAt: new Date() },
        }),
        prisma.property.update({
          where: { id: request.propertyId },
          data: { tokenId: mintedTokenId, status: "MINTED", chainHash: metadataHash },
        }),
        // upsert avoids P2002 on re-approval (version 1 may already exist from a partial run)
        prisma.metadataVersion.upsert({
          where: {
            propertyId_versionNo: {
              propertyId: request.propertyId,
              versionNo:  1,
            },
          },
          update: {
            metadataHash,
            imagesRootHash,
            documentsRootHash,
            metadataSnapshot: request.metadataSnapshot,
            approvedBy:       req.govWallet || "admin",
          },
          create: {
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

      await notifyUser(
        request.submittedBy,
        "REQUEST_APPROVED",
        "Property approved 🎉",
        `Your property "${request.metadataSnapshot?.name || "submission"}" has been approved and is now live on the marketplace.`,
        "/dashboard/my-requests",
      );

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
      try {
        const onChainUpdates = await getPropertyNFT().getUpdateRequests(property.tokenId);
        const pendingIndex = onChainUpdates.findIndex((u) => Number(u.status) === 0);
        if (pendingIndex !== -1) {
          const receipt = await approveUpdateOnChain(property.tokenId, pendingIndex);
          txHash = receipt.transactionHash;
        }
      } catch (chainErr) {
        console.warn("[chain] approveUpdateRequest failed, DB-only:", chainErr.message);
      }

      await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: { status: "APPROVED", reviewedBy: req.govWallet || "admin", reviewedAt: new Date() },
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

// ── POST /api/admin/decline/:requestId ───────────────────────────────────────
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

    await notifyUser(
      request.submittedBy,
      "REQUEST_DECLINED",
      "Property request declined",
      reason
        ? `Your submission was declined: ${reason}`
        : "Your property submission was reviewed and declined. You may resubmit after making corrections.",
      "/dashboard/my-requests",
    );

    return res.json({ success: true, message: "Request declined", requestId, reason });

  } catch (err) {
    console.error("[declineRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listRequests,
  listDbRequests,
  getRequestDocumentImage,
  approveRequest,
  declineRequest,
};
