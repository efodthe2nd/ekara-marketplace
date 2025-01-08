// src/schedulers/bidScheduler.ts
import * as cron from 'node-cron';
import { BidService } from '../services/BidService';

export function initializeBidScheduler(bidService: BidService) {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            await bidService.checkAndEndExpiredListings();
        } catch (error) {
            console.error('Error in bid scheduler:', error);
        }
    });
}