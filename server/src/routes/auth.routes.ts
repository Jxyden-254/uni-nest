// Routes for authentication endpoints under /api/auth.
import { Router } from "express";

import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  me,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", logout);
router.get("/verify-email", asyncHandler(verifyEmail));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/google", asyncHandler(googleLogin));
router.get("/me", authenticate, asyncHandler(me));

// Example protected route demonstrating role-based access control.
// Only ADMIN users can reach it; used by the admin portal later.
router.get("/admin/ping", authenticate, authorize("ADMIN"), (_req, res) => {
  res.json({ message: "You have admin access." });
});

export default router;
