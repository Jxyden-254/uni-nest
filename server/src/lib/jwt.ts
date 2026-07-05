// Helpers for signing and verifying JSON Web Tokens.
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

// Payload stored inside every access token.
export interface JwtPayload {
  userId: number;
  role: Role;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in the environment");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  // Tokens expire after 7 days; the user must log in again after that.
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
