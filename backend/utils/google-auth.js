// utils/google-auth.js
// Passport Google OAuth2 strategy — find-or-create user, issue JWT, redirect to frontend.

const passport   = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { PrismaClient } = require("@prisma/client");
const jwt  = require("jsonwebtoken");

const prisma = new PrismaClient();

const ACCESS_SECRET   = process.env.JWT_ACCESS_SECRET  || "access_secret_change_me";
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET || "refresh_secret_change_me";
const ACCESS_EXPIRES  = "15m";
const REFRESH_EXPIRES = "7d";

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

/**
 * Register the Google strategy only when credentials are configured.
 * If GOOGLE_CLIENT_ID / SECRET are missing the strategy is skipped —
 * the button simply won't work until credentials are added.
 */
function setupGoogleStrategy() {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL  = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (!clientID || clientID === "your-google-client-id") {
    console.warn("[google-auth] GOOGLE_CLIENT_ID not set — Google OAuth is disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email      = profile.emails?.[0]?.value;
          const first_name = profile.name?.givenName  || profile.displayName?.split(" ")[0] || "Google";
          const last_name  = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "User";
          const avatar     = profile.photos?.[0]?.value ?? null;

          if (!email) {
            return done(new Error("Google account has no email address"), null);
          }

          // Find or create the user
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                passwordHash:   "",          // no password for OAuth users
                first_name,
                last_name,
                isEmailVerified: true,        // Google verifies the email
                avatar,
                role:            "USER",
              },
            });
            console.log(`[google-auth] New user created via Google: ${email}`);
          } else {
            // Update avatar if changed
            if (avatar && user.avatar !== avatar) {
              await prisma.user.update({ where: { id: user.id }, data: { avatar } });
              user.avatar = avatar;
            }
            console.log(`[google-auth] Existing user signed in via Google: ${email}`);
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );

  // Passport serialize/deserialize (minimal — we only use sessions briefly for the redirect)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  console.log("[google-auth] Google OAuth2 strategy registered.");
}

/**
 * After Google callback, issue JWT tokens and redirect to frontend.
 * Tokens are passed as query params so the frontend can store them.
 */
async function handleGoogleCallback(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=google_failed`,
      );
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data:  { refreshTokens: { push: refreshToken } },
    });

    // Set refresh token cookie (same as regular login)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token + user info in query params
    const frontendUrl  = process.env.FRONTEND_URL || "http://localhost:3000";
    const userPayload  = encodeURIComponent(JSON.stringify({
      id:              user.id,
      email:           user.email,
      first_name:      user.first_name,
      last_name:       user.last_name,
      role:            user.role,
      avatar:          user.avatar,
      isEmailVerified: user.isEmailVerified,
      isVerified:      user.isVerified,
    }));

    return res.redirect(
      `${frontendUrl}/auth/google/callback?token=${accessToken}&user=${userPayload}`,
    );
  } catch (err) {
    console.error("[google-auth] handleGoogleCallback error:", err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/auth/login?error=google_failed`);
  }
}

module.exports = { setupGoogleStrategy, handleGoogleCallback };
