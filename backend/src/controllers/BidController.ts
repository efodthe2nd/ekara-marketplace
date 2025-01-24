import { Router, Response, RequestHandler } from 'express';
import { BidService } from '../services/BidService';
import { CreateBidListingDto, PlaceBidDto } from '../dto/bid';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware';

export class BidController {
    public router: Router;

    constructor(private bidService: BidService) {}

    private createBidListing = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const listingDto: CreateBidListingDto = req.body;
            const listing = await this.bidService.createBidListing(listingDto, req.user.id);
            
            res.status(201).json({
                message: 'Bid listing created successfully',
                listing
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error creating bid listing' });
        }
    }

    private getActiveBidListings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            
            const { listings, total } = await this.bidService.getActiveBidListings(page, limit);
            
            res.json({
                listings,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error fetching listings' });
        }
    }

    private getBidListingById = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const listing = await this.bidService.getBidListingById(Number(req.params.id));
            res.json(listing);
        } catch (error: any) {
            res.status(404).json({ message: error?.message || 'Listing not found' });
        }
    }

    private placeBid = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const bidDto: PlaceBidDto = req.body;
            const bid = await this.bidService.placeBid(
                Number(req.params.id),
                req.user.id,
                bidDto
            );

            res.status(201).json({
                message: 'Bid placed successfully',
                bid
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error placing bid' });
        }
    }

    private getUserBids = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const bids = await this.bidService.getUserBids(req.user.id);
            res.json(bids);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error fetching user bids' });
        }
    }
}