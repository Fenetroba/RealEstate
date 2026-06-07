// index.js
// Express app entry point for the real estate backend.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const { startMarketplaceListener } = require("./utils/contract");

const authRouter       = require("./routes/auth");
const propertiesRouter = require("./routes/properties");
const adminRouter      = require("./routes/admin");
const verifyRouter     = require("./routes/verify");
const kycRouter        = require("./routes/kyc");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-gov-wallet", "Authorization"],
  credentials: true, // required for httpOnly cookie (refresh token)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRouter);
app.use("/api/kyc",        kycRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/verify", verifyRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log("[db] PostgreSQL connected");

    // Start blockchain event listener (keeps ownerWallet in sync on sales)
    // Comment this out if your Hardhat node isn't running yet
    try {
      startMarketplaceListener(prisma);
    } catch (err) {
      console.warn("[chain] Marketplace listener failed to start (is your node running?):", err.message);
    }

    app.listen(PORT, () => {
      console.log(`[server] Running on http://localhost:${PORT}`);
      console.log(`[routes] POST   /api/auth/register`);
      console.log(`[routes] POST   /api/auth/login`);
      console.log(`[routes] POST   /api/auth/logout`);
      console.log(`[routes] POST   /api/auth/refresh`);
      console.log(`[routes] GET    /api/auth/me`);
      console.log(`[routes] PUT    /api/auth/profile`);
      console.log(`[routes] POST   /api/auth/connect-wallet`);
      console.log(`[routes] POST   /api/kyc/submit`);
      console.log(`[routes] GET    /api/kyc/status`);
      console.log(`[routes] GET    /api/kyc/admin/submissions`);
      console.log(`[routes] POST   /api/kyc/admin/:id/approve`);
      console.log(`[routes] POST   /api/kyc/admin/:id/reject`);
      console.log(`[routes] GET    /api/kyc/admin/document/:id`);
      console.log(`[routes] POST   /api/properties/request`);
      console.log(`[routes] POST   /api/properties/:id/update-request`);
      console.log(`[routes] GET    /api/properties`);
      console.log(`[routes] GET    /api/properties/:id`);
      console.log(`[routes] GET    /api/properties/:id/images`);
      console.log(`[routes] GET    /api/properties/:id/documents`);
      console.log(`[routes] GET    /api/admin/requests`);
      console.log(`[routes] POST   /api/admin/approve/:requestId`);
      console.log(`[routes] POST   /api/admin/decline/:requestId`);
      console.log(`[routes] GET    /api/verify/:tokenId`);
    });
  } catch (err) {
    console.error("[startup error]", err);
    process.exit(1);
  }
}

start();
