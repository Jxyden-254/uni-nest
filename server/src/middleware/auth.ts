// Authentication and authorization middleware.
import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

import { verifyToken, JwtPayload } from "../lib/jwt";

// Attach the decoded token payload to the request object.
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Checks the "Authorization: Bearer <token>" header and rejects
// the request if the token is missing or invalid.
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    req.user = verifyToken(header.slice("Bearer ".length));
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role-based access control: only allows users whose role is in the list.
// Example: router.get("/admin", authenticate, authorize("ADMIN"), handler)
export function authorize(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "You do not have permission to access this resource" });
      return;
    }
    next();
  };
}
