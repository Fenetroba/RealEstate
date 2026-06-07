// middleware/upload.js
// Multer configured for memory storage — files stay as Buffers,
// never written to disk. Hash.js then hashes them immediately.

const multer = require("multer");

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE_MB = 10;

const storage = multer.memoryStorage(); // files live in req.files as Buffers

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // bytes
    files: 20, // max files per request
  },
});

// Named field upload — matches the frontend's FormData field names:
//   images[]   → property photos
//   documents[] → deeds, surveys, IDs etc.
const uploadPropertyFiles = upload.fields([
  { name: "images", maxCount: 15 },
  { name: "documents", maxCount: 5 },
]);

module.exports = { uploadPropertyFiles };
