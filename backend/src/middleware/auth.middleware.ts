// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        isBuyer: boolean;
        isSeller: boolean;
    };
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-secret-key'
        );
        (req as AuthRequest).user = decoded as any;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

// Middleware for checking specific roles
// In auth.middleware.ts, update requireRole
export const requireRole = (role: 'buyer' | 'seller') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;
        console.log('Role check:', {
            required: role,
            user: authReq.user,
            hasBuyer: authReq.user?.isBuyer,
            hasSeller: authReq.user?.isSeller
        });
        
        if (!authReq.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const hasRole = role === 'buyer' ? authReq.user.isBuyer : authReq.user.isSeller;
        
        if (!hasRole) {
            res.status(403).json({ 
                message: `This action requires ${role} privileges` 
            });
            return;
        }

        next();
    };
};
// Middleware for checking multiple roles
export const requireAnyRole = (roles: ('buyer' | 'seller')[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const hasRequiredRole = roles.some(role => 
            role === 'buyer' ? authReq.user!.isBuyer : authReq.user!.isSeller
        );
        
        if (!hasRequiredRole) {
            res.status(403).json({ 
                message: `This action requires one of these roles: ${roles.join(', ')}` 
            });
            return;
        }

        next();
    };
};