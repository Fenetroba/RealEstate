// controllers/properties.controller.js

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { hashBuffer, hashMetadata, computeRootHash } = require("../utils/hash");

const prisma = new PrismaClient();

// In-memory store for uploads awaiting chain confirmation (replace with Redis in prod)
const pendingUploads = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingUploads.entries()) {
    if (val.expiresAt < now) pendingUploads.delete(key);
  }
}, 5 * 60 * 1000);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function saveFilesToDb(files, propertyId, uploaderWallet, versionNo = 1) {
  const images    = files.images    || [];
  const documents = files.documents || [];

  const imageHashes = [];
  const docHashes   = [];
  const savedDocs   = [];

  for (const file of images) {
    const hash = hashBuffer(file.buffer);
    imageHashes.push(hash);
    const doc = await prisma.document.create({
      data: {
        propertyId,
        fileData:   file.buffer,
        sha256Hash: hash,
        fileName:   file.originalname,
        mimeType:   file.mimetype,
        fileType:   "IMAGE",
        docType:    "photo",
        versionNo,
        sizeBytes:  file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    });
    savedDocs.push(doc);
  }

  for (const file of documents) {
    const hash = hashBuffer(file.buffer);
    docHashes.push(hash);
    const doc = await prisma.document.create({
      data: {
        propertyId,
        fileData:   file.buffer,
        sha256Hash: hash,
        fileName:   file.originalname,
        mimeType:   file.mimetype,
        fileType:   "DOCUMENT",
        docType:    "deed",
        versionNo,
        sizeBytes:  file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    });
    savedDocs.push(doc);
  }

  return { savedDocs, imageHashes, docHashes };
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/properties/request/prepare
 * Hash files, cache temporarily, return hashes for on-chain call
 */
async function prepareRequest(req, res) {
  try {
    const {
      wallet, name, location, propertyType,
      bedrooms, bathrooms, sqft, parking,
      floors, yearBuilt, price, description,
    } = req.body;

    if (!wallet || !name || !location || !propertyType || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const images    = req.files?.images    || [];
    const documents = req.files?.documents || [];

    const imageHashes = images.map((f) => hashBuffer(f.buffer));
    const docHashes   = documents.map((f) => hashBuffer(f.buffer));

    const imagesRootHash    = computeRootHash(imageHashes);
    const documentsRootHash = computeRootHash(docHashes);

    const metadataObj = {
      name,
      location,
      propertyType,
      bedrooms:  parseInt(bedrooms)  || 0,
      bathrooms: parseInt(bathrooms) || 0,
      squareFeet: parseInt(sqft)     || 0,
      parking:   parseInt(parking)   || 0,
      floors:    parseInt(floors)    || 0,
      yearBuilt: parseInt(yearBuilt) || 0,
      price:     price.toString(),
      description: description || "",
      imagesRootHash,
      documentsRootHash,
      version: 1,
    };

    const metadataHash = hashMetadata(metadataObj);
    const tempId = crypto.randomUUID();

    pendingUploads.set(tempId, {
      wallet, metadataObj, metadataHash,
      imagesRootHash, documentsRootHash,
      imageFiles: images, docFiles: documents,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return res.status(200).json({
      tempId,
      hashes: { metadataHash, imagesRootHash, documentsRootHash },
    });
  } catch (err) {
    console.error("[prepareRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/properties/request/confirm
 * Write everything to DB after MetaMask confirms
 */
async function confirmRequest(req, res) {
  try {
    const { tempId, txHash } = req.body;
    if (!tempId || !txHash) {
      return res.status(400).json({ error: "tempId and txHash are required" });
    }

    const pending = pendingUploads.get(tempId);
    if (!pending) {
      return res.status(404).json({
        error: "No pending upload found — may have expired (10 min limit)",
      });
    }
    pendingUploads.delete(tempId);

    const {
      wallet, metadataObj, metadataHash,
      imagesRootHash, documentsRootHash,
      imageFiles, docFiles,
    } = pending;

    const property = await prisma.property.create({
      data: {
        tokenId:      `pending_${Date.now()}`,
        ownerWallet:  wallet.toLowerCase(),
        status:       "PENDING",
        name:         metadataObj.name,
        location:     metadataObj.location,
        propertyType: metadataObj.propertyType,
        bedrooms:     metadataObj.bedrooms,
        bathrooms:    metadataObj.bathrooms,
        squareFeet:   metadataObj.squareFeet || 0,
        parking:      metadataObj.parking    || 0,
        floors:       metadataObj.floors     || 0,
        yearBuilt:    metadataObj.yearBuilt  || 0,
        price:        metadataObj.price ? metadataObj.price.toString() : "0",
        description:  metadataObj.description || null,
        metadataHash, imagesRootHash, documentsRootHash,
      },
    });

    const savedDocs = [];

    for (const file of imageFiles) {
      const hash = hashBuffer(file.buffer);
      const doc = await prisma.document.create({
        data: {
          propertyId: property.id,
          fileData:   file.buffer,
          sha256Hash: hash,
          fileName:   file.originalname,
          mimeType:   file.mimetype,
          fileType:   "IMAGE",
          docType:    "photo",
          versionNo:  1,
          sizeBytes:  file.size,
          uploadedBy: wallet.toLowerCase(),
        },
      });
      savedDocs.push(doc);
    }

    for (const file of docFiles) {
      const hash = hashBuffer(file.buffer);
      const doc = await prisma.document.create({
        data: {
          propertyId: property.id,
          fileData:   file.buffer,
          sha256Hash: hash,
          fileName:   file.originalname,
          mimeType:   file.mimetype,
          fileType:   "DOCUMENT",
          docType:    "deed",
          versionNo:  1,
          sizeBytes:  file.size,
          uploadedBy: wallet.toLowerCase(),
        },
      });
      savedDocs.push(doc);
    }

    const request = await prisma.request.create({
      data: {
        propertyId:       property.id,
        type:             "MINT",
        status:           "PENDING",
        metadataHash,
        imagesRootHash,
        documentsRootHash,
        metadataSnapshot: metadataObj,
        submittedBy:      wallet.toLowerCase(),
        documentIds:      savedDocs.map((d) => d.id),
      },
    });

    return res.status(201).json({
      message:    "Property request confirmed and saved",
      requestId:  request.id,
      propertyId: property.id,
      txHash,
    });
  } catch (err) {
    console.error("[confirmRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/properties/:id/update-request
 */
async function submitUpdateRequest(req, res) {
  try {
    const { id } = req.params;
    const {
      wallet, name, location, propertyType,
      bedrooms, bathrooms, squareFeet, price, description,
    } = req.body;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: "Property not found" });
    if (property.status !== "MINTED") {
      return res.status(400).json({ error: "Property is not minted yet" });
    }
    if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Only the owner can submit updates" });
    }

    const lastVersion = await prisma.metadataVersion.findFirst({
      where: { propertyId: id },
      orderBy: { versionNo: "desc" },
    });
    const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

    let imageHashes = [];
    let docHashes   = [];
    let savedDocs   = [];

    if (req.files && (req.files.images || req.files.documents)) {
      ({ savedDocs, imageHashes, docHashes } = await saveFilesToDb(
        req.files, id, wallet, newVersionNo
      ));
    }

    const imagesRootHash    = imageHashes.length > 0
      ? computeRootHash(imageHashes)
      : property.imagesRootHash;
    const documentsRootHash = docHashes.length > 0
      ? computeRootHash(docHashes)
      : property.documentsRootHash;

    const metadataObj = {
      name:         name         || property.name,
      location:     location     || property.location,
      propertyType: propertyType || property.propertyType,
      bedrooms:     parseInt(bedrooms)    || property.bedrooms,
      bathrooms:    parseInt(bathrooms)   || property.bathrooms,
      squareFeet:   parseInt(squareFeet)  || property.squareFeet,
      price:        price                 || property.price,
      description:  description           || property.description || "",
      imagesRootHash,
      documentsRootHash,
      version: newVersionNo,
    };

    const metadataHash = hashMetadata(metadataObj);

    const request = await prisma.request.create({
      data: {
        propertyId:       id,
        type:             "UPDATE",
        status:           "PENDING",
        metadataHash,
        imagesRootHash,
        documentsRootHash,
        metadataSnapshot: metadataObj,
        submittedBy:      wallet.toLowerCase(),
        documentIds:      savedDocs.map((d) => d.id),
      },
    });

    return res.status(201).json({
      message:   "Update request submitted",
      requestId: request.id,
      hashes:    { metadataHash, imagesRootHash, documentsRootHash },
    });
  } catch (err) {
    console.error("[submitUpdateRequest]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/properties
 */
async function listProperties(req, res) {
  try {
    const { location, propertyType, bedrooms } = req.query;

    const where = { status: "MINTED" };
    if (location)     where.location     = { contains: location, mode: "insensitive" };
    if (propertyType) where.propertyType = propertyType;
    if (bedrooms)     where.bedrooms     = parseInt(bedrooms);

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true, tokenId: true, ownerWallet: true,
        name: true, location: true, propertyType: true,
        bedrooms: true, bathrooms: true, squareFeet: true,
        price: true, metadataHash: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(properties);
  } catch (err) {
    console.error("[listProperties]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/properties/:id
 */
async function getProperty(req, res) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        metadataVersions: { orderBy: { versionNo: "desc" } },
        requests:         { orderBy: { submittedAt: "desc" } },
      },
    });
    if (!property) return res.status(404).json({ error: "Property not found" });
    return res.json(property);
  } catch (err) {
    console.error("[getProperty]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/properties/:id/images
 */
async function getPropertyImages(req, res) {
  try {
    const { versionNo } = req.query;
    const where = { propertyId: req.params.id, fileType: "IMAGE" };
    if (versionNo) where.versionNo = parseInt(versionNo);

    const images = await prisma.document.findMany({ where, orderBy: { createdAt: "asc" } });
    return res.json(images.map((img) => ({
      id: img.id, fileName: img.fileName, mimeType: img.mimeType,
      sha256Hash: img.sha256Hash, sizeBytes: img.sizeBytes,
      versionNo: img.versionNo,
      data: img.fileData.toString("base64"),
    })));
  } catch (err) {
    console.error("[getPropertyImages]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/properties/:id/documents
 */
async function getPropertyDocuments(req, res) {
  try {
    const { versionNo } = req.query;
    const where = { propertyId: req.params.id, fileType: "DOCUMENT" };
    if (versionNo) where.versionNo = parseInt(versionNo);

    const documents = await prisma.document.findMany({ where, orderBy: { createdAt: "asc" } });
    return res.json(documents.map((doc) => ({
      id: doc.id, fileName: doc.fileName, mimeType: doc.mimeType,
      docType: doc.docType, sha256Hash: doc.sha256Hash,
      sizeBytes: doc.sizeBytes, versionNo: doc.versionNo,
      data: doc.fileData.toString("base64"),
    })));
  } catch (err) {
    console.error("[getPropertyDocuments]", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/properties/my-requests
 * Returns requests submitted by the logged-in user.
 * Matches by:
 *   1. wallet address if user has one linked
 *   2. OR the "user:<id>" identifier stored when submitting without a wallet
 */
async function getMyRequests(req, res) {
  try {
    const userId = req.userId;

    // Find the user's wallet address (if any)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    // Build an OR query: match by wallet OR by user:<id> identifier
    const orConditions = [
      { submittedBy: { startsWith: `user:${userId}` } },
    ];
    if (user?.walletAddress) {
      orConditions.push({ submittedBy: user.walletAddress.toLowerCase() });
    }

    const requests = await prisma.request.findMany({
      where: { OR: orConditions },
      include: {
        property: {
          select: {
            id: true, name: true, location: true, propertyType: true,
            status: true, price: true, tokenId: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("[getMyRequests]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  prepareRequest,
  confirmRequest,
  submitUpdateRequest,
  listProperties,
  getProperty,
  getPropertyImages,
  getPropertyDocuments,
  getMyRequests,
};
