// controllers/auth.controller.js

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ACCESS_SECRET   = process.env.JWT_ACCESS_SECRET  || "access_secret_change_me";
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET || "refresh_secret_change_me";
const ACCESS_EXPIRES  = "15m";
const REFRESH_EXPIRES = "7d";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

function sanitizeUser(user) {
  const { passwordHash, refreshTokens, ...safe } = user;
  return safe;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: "email, password, first_name and last_name are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email:      email.toLowerCase().trim(),
        passwordHash,
        first_name: first_name.trim(),
        last_name:  last_name.trim(),
        role:       "USER", // self-registration is always USER
      },
    });

    return res.status(201).json({
      success: true,
      data: { message: "Registration successful. You can now log in." },
    });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Keep last 5 refresh tokens per user (multi-device support)
    const tokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokens: tokens } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (user) {
        const tokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
        await prisma.user.update({ where: { id: req.userId }, data: { refreshTokens: tokens } });
      }
    }

    res.clearCookie("refreshToken");
    return res.json({ success: true, data: { message: "Logged out" } });
  } catch (err) {
    console.error("[logout]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: "Refresh token revoked" });
    }

    const newAccessToken = generateAccessToken(user);
    return res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    console.error("[refresh]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    console.error("[getMe]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    const { first_name, last_name, phone, location, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(first_name !== undefined && { first_name: first_name.trim() }),
        ...(last_name  !== undefined && { last_name:  last_name.trim()  }),
        ...(phone      !== undefined && { phone:      phone || null     }),
        ...(location   !== undefined && { location:   location || null  }),
        ...(avatar     !== undefined && { avatar:     avatar || null    }),
      },
    });

    return res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    console.error("[updateProfile]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/auth/connect-wallet
 */
async function connectWallet(req, res) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: "walletAddress is required" });
    }

    const existing = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (existing && existing.id !== req.userId) {
      return res.status(409).json({
        success: false,
        message: "Wallet already linked to another account",
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { walletAddress: walletAddress.toLowerCase() },
    });

    return res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    console.error("[connectWallet]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/auth/admin/users  (ADMIN only)
 * Returns all users with their latest KYC submission status
 */
async function adminListUsers(req, res) {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, first_name: true, last_name: true,
        role: true, phone: true, location: true, walletAddress: true,
        isVerified: true, isEmailVerified: true, createdAt: true,
        kycSubmissions: {
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: {
            id: true, status: true, submittedAt: true,
            reviewedAt: true, rejectReason: true,
            documents: {
              select: {
                id: true, kind: true, fileName: true,
                mimeType: true, sizeBytes: true, createdAt: true,
              },
            },
          },
        },
      },
    });

    const data = users.map((u) => ({
      ...u,
      latestKyc: u.kycSubmissions[0] ?? null,
      kycSubmissions: undefined,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("[adminListUsers]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/auth/verify-password
 * Verifies the current user's password without logging in again.
 * Used for sensitive admin actions (e.g. approve property).
 */
async function verifyPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    return res.json({ success: true, data: { verified: true } });
  } catch (err) {
    console.error("[verifyPassword]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, logout, refresh, getMe, updateProfile, connectWallet, adminListUsers, verifyPassword };

