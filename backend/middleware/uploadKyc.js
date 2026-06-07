// middleware/uploadKyc.js
// Multer config for KYC identity document uploads (images only, max 10MB each)

const multer = require("multer");

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE     = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP allowed.`));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Expects fields: id_front, id_back, selfie
const uploadKycDocs = upload.fields([
  { name: "id_front", maxCount: 1 },
  { name: "id_back",  maxCount: 1 },
  { name: "selfie",   maxCount: 1 },
]);

module.exports = { uploadKycDocs };
