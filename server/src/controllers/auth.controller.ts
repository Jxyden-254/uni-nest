// Authentication controller: registration, login, logout, email
// verification, password reset, and Google login.
import crypto from "crypto";

import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { Role } from "@prisma/client";

import { sendEmail } from "../lib/email";
import { signToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

const SALT_ROUNDS = 10;

// Roles a visitor may register as. ADMIN accounts are created manually.
const SELF_REGISTER_ROLES: Role[] = ["STUDENT", "LANDLORD", "UNIVERSITY", "COMPANY"];

// Strips sensitive fields before sending a user object to the client.
function publicUser(user: {
  id: number;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
  };
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (role && !SELF_REGISTER_ROLES.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role || "STUDENT",
      emailVerifyToken: verifyToken,
    },
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  await sendEmail({
    to: email,
    subject: "Verify your UNI-NEST email",
    text: `Welcome to UNI-NEST, ${name}!\n\nPlease verify your email by opening this link:\n${clientUrl}/verify-email?token=${verifyToken}`,
  });

  res.status(201).json({
    message: "Account created. Check your email to verify your address.",
    user: publicUser(user),
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Same error for wrong email and wrong password so attackers
  // cannot tell which one was incorrect.
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: publicUser(user) });
}

// POST /api/auth/logout
// JWTs are stateless, so logout simply tells the client to discard its token.
export function logout(_req: Request, res: Response): void {
  res.json({ message: "Logged out. Please remove the token on the client." });
}

// GET /api/auth/verify-email?token=...
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(400).json({ error: "Verification token is required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) {
    res.status(400).json({ error: "Invalid or already used verification token" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  res.json({ message: "Email verified successfully. You can now log in." });
}

// POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same message so attackers cannot discover
  // which emails are registered.
  const message = "If that email is registered, a reset link has been sent.";

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        // Link is valid for 1 hour.
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    await sendEmail({
      to: email,
      subject: "Reset your UNI-NEST password",
      text: `Hello ${user.name},\n\nReset your password by opening this link (valid for 1 hour):\n${clientUrl}/reset-password?token=${resetToken}`,
    });
  }

  res.json({ message });
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    res.status(400).json({ error: "token and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpires: null },
  });

  res.json({ message: "Password reset successfully. You can now log in." });
}

// POST /api/auth/google
// The client obtains an ID token from Google Sign-In and sends it here.
export async function googleLogin(req: Request, res: Response): Promise<void> {
  const { idToken } = req.body as { idToken?: string };
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    res.status(503).json({ error: "Google login is not configured on this server" });
    return;
  }
  if (!idToken) {
    res.status(400).json({ error: "idToken is required" });
    return;
  }

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    res.status(401).json({ error: "Invalid Google token" });
    return;
  }

  if (!payload?.email || !payload.sub) {
    res.status(401).json({ error: "Google token is missing required information" });
    return;
  }

  // Find an existing account by Google ID or email, otherwise create one.
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
  });

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, emailVerified: true },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: payload.name || payload.email,
        email: payload.email,
        googleId: payload.sub,
        avatarUrl: payload.picture || null,
        // Google has already verified this email address.
        emailVerified: true,
        role: "STUDENT",
      },
    });
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: publicUser(user) });
}

// GET /api/auth/me — returns the currently logged-in user.
export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
}
