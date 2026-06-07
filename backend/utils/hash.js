/**
 * utils/hash.js
 *
 * SHA-256 hashing utilities for the hybrid Web2 + Web3 real estate system.
 *
 * Three exports:
 *   hashBuffer(buffer)              → hex string  (for raw files)
 *   hashMetadata(metadataObject)    → hex string  (for JSON metadata)
 *   computeRootHash(hexHashArray)   → hex string  (Merkle-style root over an array of hashes)
 *
 * All hashes are 64-char hex strings (32 bytes).
 * For on-chain storage, convert to bytes32 with ethers.js: ethers.utils.hexZeroPad("0x" + hash, 32)
 */

const crypto = require("crypto");

// ---------------------------------------------------------------------------
// 1. hashBuffer
//    Input : a Buffer (e.g. from multer memoryStorage, fs.readFileSync, etc.)
//    Output: 64-char lowercase hex string
//
//    Use this for every individual file — deed PDFs, survey images, ID scans.
//    Store the result in documents.sha256_hash.
// ---------------------------------------------------------------------------
function hashBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("hashBuffer expects a Buffer, got: " + typeof buffer);
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ---------------------------------------------------------------------------
// 2. hashMetadata
//    Input : a plain JS object (the property metadata)
//    Output: 64-char lowercase hex string
//
//    IMPORTANT: keys are sorted before serialization so that
//    { a:1, b:2 } and { b:2, a:1 } produce the SAME hash.
//    Always pass the canonical metadata shape (see example below).
//
//    Example canonical metadata object:
//    {
//      tokenId:      "42",
//      name:         "Sunrise Villa",
//      location:     "Addis Ababa, Bole",
//      propertyType: "Residential",
//      bedrooms:     3,
//      bathrooms:    2,
//      squareFeet:   1800,
//      price:        "250000000000000000",   // wei as string
//      description:  "Corner plot, title deed attached",
//      version:      1
//    }
// ---------------------------------------------------------------------------
function hashMetadata(metadataObject) {
  if (typeof metadataObject !== "object" || metadataObject === null) {
    throw new TypeError("hashMetadata expects a plain object");
  }
  // Deterministic JSON: sort keys recursively
  const canonical = JSON.stringify(metadataObject, sortedReplacer);
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

// Helper: JSON.stringify replacer that sorts object keys alphabetically
function sortedReplacer(key, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce((sorted, k) => {
        sorted[k] = value[k];
        return sorted;
      }, {});
  }
  return value;
}

// ---------------------------------------------------------------------------
// 3. computeRootHash
//    Input : array of 64-char hex strings (individual file hashes)
//    Output: 64-char hex string — a single "root" that commits to all of them
//
//    Algorithm: binary Merkle tree (same idea as Bitcoin/Ethereum).
//    - If the array has one element, that element IS the root.
//    - If the array has an odd number, the last element is duplicated
//      (standard Merkle padding).
//    - Pairs are concatenated as hex strings and hashed together, level by level.
//
//    Why Merkle and not just hash(concat(all))?
//    A Merkle root lets you prove a single file is included WITHOUT revealing
//    all the others — useful for selective disclosure later.
//
//    Use this to compute:
//      imagesRootHash    = computeRootHash([ hash(img1), hash(img2), ... ])
//      documentsRootHash = computeRootHash([ hash(doc1), hash(doc2), ... ])
//
//    If there are zero files, returns the hash of an empty string.
// ---------------------------------------------------------------------------
function computeRootHash(hexHashArray) {
  if (!Array.isArray(hexHashArray)) {
    throw new TypeError("computeRootHash expects an array of hex strings");
  }

  // Validate each element
  hexHashArray.forEach((h, i) => {
    if (typeof h !== "string" || !/^[0-9a-f]{64}$/i.test(h)) {
      throw new TypeError(
        `computeRootHash: element at index ${i} is not a valid 64-char hex hash`
      );
    }
  });

  // Edge case: empty array
  if (hexHashArray.length === 0) {
    return crypto.createHash("sha256").update("").digest("hex");
  }

  // Edge case: single element — it is its own root
  if (hexHashArray.length === 1) {
    return hexHashArray[0];
  }

  // Build Merkle tree level by level
  let level = [...hexHashArray];

  while (level.length > 1) {
    // Pad odd-length levels by duplicating the last element
    if (level.length % 2 !== 0) {
      level.push(level[level.length - 1]);
    }

    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const combined = level[i] + level[i + 1]; // 128-char hex string
      const parent = crypto
        .createHash("sha256")
        .update(combined, "hex")        // interpret as raw bytes
        .digest("hex");
      nextLevel.push(parent);
    }
    level = nextLevel;
  }

  return level[0];
}

// ---------------------------------------------------------------------------
// Convenience: toBytes32
//    Converts a 64-char hex hash to an ethers.js-compatible bytes32 string.
//    Use when passing hashes to your smart contract calls.
//
//    Example:
//      const { toBytes32 } = require("./utils/hash");
//      await contract.mintProperty(tokenId, toBytes32(metaHash), toBytes32(imagesRoot), toBytes32(docsRoot));
// ---------------------------------------------------------------------------
function toBytes32(hexHash) {
  if (typeof hexHash !== "string" || !/^[0-9a-f]{64}$/i.test(hexHash)) {
    throw new TypeError("toBytes32 expects a 64-char hex string");
  }
  return "0x" + hexHash.toLowerCase();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  hashBuffer,
  hashMetadata,
  computeRootHash,
  toBytes32,
};
