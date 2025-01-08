import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { BidListing } from '../entities/BidListing';
import { Bid } from '../entities/Bid';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { CreateBidListingDto, PlaceBidDto } from '../dto/bid';
import { BidListingStatus, BidStatus } from '../entities/enums';

export class BidService {
    constructor(
        private bidListingRepository: Repository<BidListing>,
        private bidRepository: Repository<Bid>,
        private productRepository: Repository<Product>
    ) {}

    async createBidListing(dto: CreateBidListingDto, sellerId: number): Promise<BidListing> {
        const product = await this.productRepository.findOne({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const listing: BidListing = this.bidListingRepository.create({
            title: dto.title,
            description: dto.description,
            startingPrice: dto.startingPrice,
            currentPrice: dto.startingPrice,
            minimumIncrement: dto.minimumIncrement,
            endTime: dto.endTime,
            product,
            seller: { id: sellerId } as User,
            status: BidListingStatus.ACTIVE,
        });
        

        console.log(listing);
        return await this.bidListingRepository.save(listing);
    }

    async placeBid(listingId: number, bidderId: number, dto: PlaceBidDto): Promise<Bid> {
        const listing = await this.bidListingRepository.findOne({
            where: { id: listingId },
            relations: ['bids'],
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        if (listing.status !== BidListingStatus.ACTIVE) {
            throw new Error('This listing is no longer active');
        }

        if (listing.endTime < new Date()) {
            listing.status = BidListingStatus.ENDED;
            await this.bidListingRepository.save(listing);
            throw new Error('This auction has ended');
        }

        if (dto.amount < listing.currentPrice + listing.minimumIncrement) {
            throw new Error(`Bid must be at least ${listing.currentPrice + listing.minimumIncrement}`);
        }

        const bid = this.bidRepository.create({
            listing,
            bidder: { id: bidderId },
            amount: dto.amount,
            status: BidStatus.ACTIVE,
        });

        await this.bidRepository.save(bid);

        listing.currentPrice = dto.amount;
        await this.bidListingRepository.save(listing);

        return bid;
    }


    async getActiveBidListings(page: number = 1, limit: number = 10): Promise<{ listings: BidListing[], total: number }> {
        const [listings, total] = await this.bidListingRepository.findAndCount({
            where: {
                status: BidListingStatus.ACTIVE,
                endTime: MoreThanOrEqual(new Date())
            },
            relations: ['seller', 'product'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit
        });

        return { listings, total };
    }

    async getBidListingById(id: number): Promise<BidListing> {
        const listing = await this.bidListingRepository.findOne({
            where: { id },
            relations: ['seller', 'product', 'bids', 'bids.bidder']
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        return listing;
    }

    async getUserBids(userId: number): Promise<Bid[]> {
        return this.bidRepository.find({
            where: { bidder: { id: userId } },
            relations: ['listing', 'listing.product'],
            order: { createdAt: 'DESC' }
        });
    }

    async checkAndEndExpiredListings(): Promise<void> {
        // Change this line
        const expiredListings: BidListing[] = await this.bidListingRepository.find({
            where: {
                status: BidListingStatus.ACTIVE,
                endTime: LessThan(new Date())
            },
            relations: ['bids', 'bids.bidder']
        });
    
        for (const listing of expiredListings) {
            listing.status = BidListingStatus.ENDED;
            
            // Fix the winning bid calculation
            const winningBid = listing.bids.length > 0 
                ? listing.bids.reduce((highest, current) => {
                    if (!highest) return current;
                    return current.amount > highest.amount ? current : highest;
                }) 
                : null;
    
            if (winningBid) {
                await Promise.all(listing.bids.map(async bid => {
                    bid.status = bid.id === winningBid.id ? BidStatus.WON : BidStatus.LOST;
                    return this.bidRepository.save(bid);
                }));
    
                listing.status = BidListingStatus.SOLD;
            }
    
            await this.bidListingRepository.save(listing);
        }
    }
}