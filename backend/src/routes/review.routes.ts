import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middleware/auth.middleware";
import { RequestHandler } from "express";

export const reviewRouter = (reviewController: ReviewController): Router => {
  const router = Router();

  // Create a review
  router.post(
    "/",
    authMiddleware,
    reviewController.createReview as RequestHandler
  );

  // Get seller stats
  router.get(
    "/seller/:sellerId/stats",
    reviewController.getSellerStats as RequestHandler
  );

  // Get reviews for a seller
  router.get(
    "/seller/:sellerId/reviews",
    reviewController.getSellerReviews as RequestHandler
  );

  // Add reply to a review (sellers only)
  router.post(
    "/:reviewId/reply",
    authMiddleware,
    reviewController.addReplyToReview as RequestHandler
  );

  // Report a review
  router.post(
    "/:reviewId/report",
    authMiddleware,
    reviewController.reportReview as RequestHandler
  );

  // Delete a review (only by the reviewer)
  router.delete(
    "/:reviewId",
    authMiddleware,
    reviewController.deleteReview as RequestHandler
  );

  return router;
};