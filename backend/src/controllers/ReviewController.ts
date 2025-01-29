import { Request, Response } from 'express';
import { ReviewService } from '../services/ReviewService';
import { AuthRequest } from '../middleware/auth.middleware';

export class ReviewController {
    constructor(private reviewService: ReviewService) {}

    createReview = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { sellerId, rating, comment } = req.body;
            const buyerId = req.user.id;

            const review = await this.reviewService.createReview({
                sellerId,
                buyerId,
                rating,
                comment
            });

            res.status(201).json(review);
        } catch (error: any) {
            console.error('Error creating review:', error);
            res.status(400).json({ message: error.message });
        }
    };


    addReplyToReview = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const reviewId = parseInt(req.params.reviewId);
            const { comment } = req.body;
            const sellerId = req.user.id;

            const updatedReview = await this.reviewService.addReplyToReview(
                reviewId,
                sellerId,
                comment
            );

            res.json(updatedReview);
        } catch (error: any) {
            console.error('Error adding reply:', error);
            res.status(400).json({ message: error.message });
        }
    };

    reportReview = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const reviewId = parseInt(req.params.reviewId);
            const { reason } = req.body;
            const reporterId = req.user.id;

            const report = await this.reviewService.reportReview(
                reviewId,
                reporterId,
                reason
            );

            res.json(report);
        } catch (error: any) {
            console.error('Error reporting review:', error);
            res.status(400).json({ message: error.message });
        }
    };

    deleteReview = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const reviewId = parseInt(req.params.reviewId);
            await this.reviewService.deleteReview(reviewId, req.user.id);

            res.status(204).send();
        } catch (error: any) {
            console.error('Error deleting review:', error);
            res.status(400).json({ message: error.message });
        }
    };

    getSellerReviews = async (req: Request, res: Response): Promise<void> => {
        try {
          const sellerId = parseInt(req.params.sellerId);
          const page = parseInt(req.query.page as string) || 1;
          const limit = parseInt(req.query.limit as string) || 5;
      
          const result = await this.reviewService.getSellerReviews(sellerId, page, limit);
          res.json(result);
        } catch (error: any) {
          console.error('Error fetching seller reviews:', error);
          res.status(500).json({ message: error.message });
        }
      };
      
      getSellerStats = async (req: Request, res: Response): Promise<void> => {
        try {
          const sellerId = parseInt(req.params.sellerId);
          const stats = await this.reviewService.getSellerStats(sellerId);
          res.json(stats);
        } catch (error: any) {
          console.error('Error fetching seller stats:', error);
          res.status(500).json({ message: error.message });
        }
      };
}