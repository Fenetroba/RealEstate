/**
 * utils/hash.test.js
 *
 * Run with:  node utils/hash.test.js
 * No test framework needed — plain Node.js assertions.
 */

const assert = require("assert");
const { hashBuffer, hashMetadata, computeRootHash, toBytes32 } = require("./hash");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
console.log("\n── hashBuffer ──────────────────────────────────────────");

test("returns a 64-char hex string", () => {
  const hash = hashBuffer(Buffer.from("hello"));
  assert.strictEqual(typeof hash, "string");
  assert.strictEqual(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("known SHA-256 of 'hello'", () => {
  // echo -n "hello" | sha256sum  →  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
  const hash = hashBuffer(Buffer.from("hello"));
  assert.strictEqual(hash, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
});

test("same buffer always produces same hash", () => {
  const buf = Buffer.from("realestate_doc_content_123");
  assert.strictEqual(hashBuffer(buf), hashBuffer(buf));
});

test("different buffers produce different hashes", () => {
  assert.notStrictEqual(hashBuffer(Buffer.from("doc1")), hashBuffer(Buffer.from("doc2")));
});

test("throws on non-Buffer input", () => {
  assert.throws(() => hashBuffer("not a buffer"), TypeError);
});

// ---------------------------------------------------------------------------
console.log("\n── hashMetadata ────────────────────────────────────────");

const sampleMeta = {
  tokenId: "42",
  name: "Sunrise Villa",
  location: "Addis Ababa, Bole",
  propertyType: "Residential",
  bedrooms: 3,
  bathrooms: 2,
  squareFeet: 1800,
  price: "250000000000000000",
  version: 1,
};

test("returns a 64-char hex string", () => {
  const hash = hashMetadata(sampleMeta);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("key order does NOT affect the hash (deterministic)", () => {
  const shuffled = {
    version: 1,
    name: "Sunrise Villa",
    tokenId: "42",
    price: "250000000000000000",
    bedrooms: 3,
    location: "Addis Ababa, Bole",
    bathrooms: 2,
    squareFeet: 1800,
    propertyType: "Residential",
  };
  assert.strictEqual(hashMetadata(sampleMeta), hashMetadata(shuffled));
});

test("changing a field changes the hash", () => {
  const modified = { ...sampleMeta, bedrooms: 4 };
  assert.notStrictEqual(hashMetadata(sampleMeta), hashMetadata(modified));
});

test("changing version number changes the hash", () => {
  const v2 = { ...sampleMeta, version: 2 };
  assert.notStrictEqual(hashMetadata(sampleMeta), hashMetadata(v2));
});

test("throws on null input", () => {
  assert.throws(() => hashMetadata(null), TypeError);
});

// ---------------------------------------------------------------------------
console.log("\n── computeRootHash ─────────────────────────────────────");

// Generate some real hashes to use as test inputs
const h1 = hashBuffer(Buffer.from("image1.jpg content"));
const h2 = hashBuffer(Buffer.from("image2.jpg content"));
const h3 = hashBuffer(Buffer.from("image3.jpg content"));
const h4 = hashBuffer(Buffer.from("image4.jpg content"));

test("single element → returns that element unchanged", () => {
  assert.strictEqual(computeRootHash([h1]), h1);
});

test("empty array → returns hash of empty string", () => {
  const emptyHash = require("crypto").createHash("sha256").update("").digest("hex");
  assert.strictEqual(computeRootHash([]), emptyHash);
});

test("returns a 64-char hex string for 2 elements", () => {
  assert.match(computeRootHash([h1, h2]), /^[0-9a-f]{64}$/);
});

test("returns a 64-char hex string for 3 elements (odd — tests padding)", () => {
  assert.match(computeRootHash([h1, h2, h3]), /^[0-9a-f]{64}$/);
});

test("returns a 64-char hex string for 4 elements", () => {
  assert.match(computeRootHash([h1, h2, h3, h4]), /^[0-9a-f]{64}$/);
});

test("same set of hashes → same root (deterministic)", () => {
  assert.strictEqual(computeRootHash([h1, h2, h3]), computeRootHash([h1, h2, h3]));
});

test("different order → different root (order matters)", () => {
  assert.notStrictEqual(computeRootHash([h1, h2]), computeRootHash([h2, h1]));
});

test("adding a file changes the root", () => {
  assert.notStrictEqual(computeRootHash([h1, h2]), computeRootHash([h1, h2, h3]));
});

test("throws on invalid hash in array", () => {
  assert.throws(() => computeRootHash(["not_a_hash"]), TypeError);
});

// ---------------------------------------------------------------------------
console.log("\n── toBytes32 ───────────────────────────────────────────");

test("prepends 0x to a valid hash", () => {
  const hash = hashBuffer(Buffer.from("test"));
  const b32 = toBytes32(hash);
  assert.strictEqual(b32, "0x" + hash);
  assert.strictEqual(b32.length, 66); // 0x + 64 chars
});

test("throws on non-hex input", () => {
  assert.throws(() => toBytes32("not_valid"), TypeError);
});

// ---------------------------------------------------------------------------
console.log("\n── Real-world simulation ───────────────────────────────");

test("full flow: upload 2 images + 1 doc → compute roots → metadata hash", () => {
  // Simulate multer giving you file buffers
  const img1 = Buffer.from("fake image data 1");
  const img2 = Buffer.from("fake image data 2");
  const doc1 = Buffer.from("fake deed PDF data");

  const imageHashes = [hashBuffer(img1), hashBuffer(img2)];
  const docHashes   = [hashBuffer(doc1)];

  const imagesRootHash    = computeRootHash(imageHashes);
  const documentsRootHash = computeRootHash(docHashes);

  const metadata = {
    tokenId: "1",
    name: "Test Property",
    location: "Addis Ababa",
    propertyType: "Commercial",
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 500,
    price: "1000000000000000000",
    imagesRootHash,
    documentsRootHash,
    version: 1,
  };

  const metadataHash = hashMetadata(metadata);

  // All three should be valid 64-char hashes
  assert.match(imagesRootHash,    /^[0-9a-f]{64}$/);
  assert.match(documentsRootHash, /^[0-9a-f]{64}$/);
  assert.match(metadataHash,      /^[0-9a-f]{64}$/);

  // toBytes32 should work on all three
  assert.doesNotThrow(() => toBytes32(imagesRootHash));
  assert.doesNotThrow(() => toBytes32(documentsRootHash));
  assert.doesNotThrow(() => toBytes32(metadataHash));
});

// ---------------------------------------------------------------------------
console.log("\n────────────────────────────────────────────────────────");
console.log(`  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
