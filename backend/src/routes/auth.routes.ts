import { Router, RequestHandler } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

export const authRouter = (userController: UserController): Router => {
  const router = Router();

  // Auth-specific routes
  router.post("/register", userController.register);

  // Email verification route
  router.get("/verify-email", userController.verifyEmail as RequestHandler);

  // Resend verification email route (optional but helpful)
  //router.post("/resend-verification", userController.resendVerificationEmail);
  router.post("/login", userController.login);

  router.get(
    "/profile",
    authMiddleware,
    userController.getProfile as RequestHandler
  );

  router.put(
    "/profile",
    authMiddleware,
    userController.updateProfile as RequestHandler
  );

  // Dashboard routes that should be under /auth
  router.get(
    "/buyer-dashboard",
    authMiddleware,
    requireRole("buyer"),
    userController.getProfile as RequestHandler
  );

  router.get(
    "/seller-dashboard",
    authMiddleware,
    requireRole("seller"),
    userController.getProfile as RequestHandler
  );

  router.get("/:userId", userController.getUserPublicProfile as RequestHandler);

  return router;
};
