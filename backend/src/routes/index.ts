import { Router } from 'express';
import { UserRoutes } from './user.routes';
import { UserService } from '../services/UserService';

export class AppRouter {
    private router: Router;
    private userService: UserService;

    constructor(userService: UserService) {
        this.router = Router();
        this.userService = userService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Mount user routes at /api/auth/*
        const userRoutes = new UserRoutes(this.userService);
        this.router.use('/auth', userRoutes.getRouter());
    }

    getRouter(): Router {
        return this.router;
    }
}