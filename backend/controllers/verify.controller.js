// controllers/verify.controller.js

const { PrismaClient } = require("@prisma/client");
const { hashBuffer, hashMetadata, computeRootHash } = require("../utils/hash");
const { getOnChainHash, getOnChainVersionHistory } = require("../utils/contract");

const prisma = new PrismaClient();

/**
 * GET /api/verify/:tokenId
 * Full tamper-proof audit — re-hashes everything in DB and compares to on-chain hash
 */
async function verifyProperty(req, res) {
  const { tokenId } = req.params;

  try {
    // 1. Fetch property
    const property = await prisma.property.findUnique({ where: { tokenId } });
    if (!property) {
      return res.status(404).json({ error: `No property found with tokenId: ${tokenId}` });
    }
    if (property.status !== "MINTED") {
      return res.status(400).json({
        error: "Property is not yet minted — nothing on-chain to verify against",
      });
    }

    // 2. Get latest version
    const latestVersion = await prisma.metadataVersion.findFirst({
      where: { propertyId: property.id },
      orderBy: { versionNo: "desc" },
    });
    const versionNo = latestVersion?.versionNo || 1;

    // 3. Fetch files (fall back to version 1)
    let images = await prisma.document.findMany({
      where: { propertyId: property.id, fileType: "IMAGE", versionNo },
    });
    if (images.length === 0) {
      images = await prisma.document.findMany({
        where: { propertyId: property.id, fileType: "IMAGE", versionNo: 1 },
      });
    }
    let documents = await prisma.document.findMany({
      where: { propertyId: property.id, fileType: "DOCUMENT", versionNo },
    });
    if (documents.length === 0) {
      documents = await prisma.document.findMany({
        where: { propertyId: property.id, fileType: "DOCUMENT", versionNo: 1 },
      });
    }

    // 4. Re-hash every file from raw bytes
    const filesIntegrity = [...images, ...documents].map((file) => {
      const recomputed = hashBuffer(file.fileData);
      return {
        id:             file.id,
        fileName:       file.fileName,
        fileType:       file.fileType,
        storedHash:     file.sha256Hash,
        recomputedHash: recomputed,
        match:          recomputed === file.sha256Hash,
      };
    });

    // 5. Recompute root hashes
    const recomputedImagesRoot = computeRootHash(images.map((f) => hashBuffer(f.fileData)));
    const recomputedDocsRoot   = computeRootHash(documents.map((f) => hashBuffer(f.fileData)));
    const imagesRootMatch      = recomputedImagesRoot === property.imagesRootHash;
    const documentsRootMatch   = recomputedDocsRoot   === property.documentsRootHash;

    // 6. Recompute metadata hash
    const recomputedMetadataHash = latestVersion?.metadataSnapshot
      ? hashMetadata(latestVersion.metadataSnapshot)
      : hashMetadata({
          name:              property.name,
          location:          property.location,
          propertyType:      property.propertyType,
          bedrooms:          property.bedrooms,
          bathrooms:         property.bathrooms,
          squareFeet:        property.squareFeet,
          parking:           property.parking   || 0,
          floors:            property.floors    || 0,
          yearBuilt:         property.yearBuilt || 0,
          price:             property.price.toString(),
          description:       property.description || "",
          imagesRootHash:    property.imagesRootHash,
          documentsRootHash: property.documentsRootHash,
          version:           versionNo,
        });

    // 7. Fetch on-chain hash
    let onChainHash  = null;
    let chainError   = null;
    let versionHistory = [];
    try {
      onChainHash = await getOnChainHash(tokenId);
    } catch (err) {
      chainError = err.message;
    }
    try {
      versionHistory = await getOnChainVersionHistory(tokenId);
    } catch (_) {}

    const match        = onChainHash ? recomputedMetadataHash === onChainHash : false;
    const allFilesMatch = filesIntegrity.every((f) => f.match);

    return res.json({
      tokenId,
      propertyName:    property.name,
      currentVersion:  versionNo,
      tamperProof:     match && allFilesMatch && imagesRootMatch && documentsRootMatch,

      dbMetadataHash:        property.metadataHash,
      recomputedMetadataHash,
      onChainHash,
      metadataHashMatch:     recomputedMetadataHash === property.metadataHash,
      onChainMatch:          match,

      imagesRootHash:    property.imagesRootHash,
      recomputedImagesRoot,
      imagesRootMatch,

      documentsRootHash: property.documentsRootHash,
      recomputedDocsRoot,
      documentsRootMatch,

      filesIntegrity,
      allFilesIntact: allFilesMatch,
      versionHistory,
      chainError:     chainError || null,
    });
  } catch (err) {
    console.error("[verifyProperty]", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { verifyProperty };
