import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

export class UserRoutes {
    private router: Router;
    private userController: UserController;

    constructor(userService: UserService) {
        this.router = Router();
        this.userController = new UserController(userService);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Public routes
        this.router.post('/register', 
            (req: Request, res: Response, next: NextFunction) => {
                return this.userController.register(req, res);
            }
        );

        this.router.post('/login',
            (req: Request, res: Response) => {
                return this.userController.login(req, res);
            }
        );

        // Protected routes
        this.router.get('/profile',
            authMiddleware,
            (req: Request, res: Response) => {
                return this.userController.getProfile(req, res);
            }
        );

        this.router.put('/profile',
            authMiddleware,
            (req: Request, res: Response) => {
                return this.userController.updateProfile(req, res);
            }
        );

        // Admin routes
        this.router.get('/users',
            authMiddleware,
            roleMiddleware(['admin']),
            (req: Request, res: Response) => {
                return this.userController.getAllUsers(req, res);
            }
        );
    }

    getRouter(): Router {
        return this.router;
    }
}