import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, LoginUserDto, UpdateUserDto, CreateSellerProfileDto } from '../dto/user/index';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
    constructor(private userService: UserService) {}

    register = async (req: Request, res: Response) => {
        try {
            const createUserDto: CreateUserDto = req.body;
            const user = await this.userService.createUser(createUserDto);
            const token = this.userService.generateToken(user);
            
            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            res.status(201).json({
                message: 'User registered successfully',
                user: userWithoutPassword,
                token
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message || 'Error registering user'
            });
        }
    };


    login = async (req: Request, res: Response) => {
        try {
            const loginUserDto: LoginUserDto = req.body;
            const user = await this.userService.validateUser(loginUserDto);
            const token = this.userService.generateToken(user);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            res.json({
                message: 'Login successful',
                user: userWithoutPassword,
                token
            });
        } catch (error: any) {
            res.status(401).json({
                message: error.message || 'Invalid credentials'
            });
        }
    };

    getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: 'User not found in request'
                });
                return;
            }
            const userId = req.user.id;
            const user = await this.userService.getUserById(userId);
            
            const { password, ...userWithoutPassword } = user;
           
            res.json({
                user: userWithoutPassword
            });
        } catch (error: any) {
            res.status(404).json({
                message: error.message || 'User not found'
            });
        }
    };
    
    updateProfile = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not found in request'
                });
            }
            const userId = req.user.id;
            const updateUserDto: UpdateUserDto = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateUserDto);
            
            // Remove password from response
            const { password, ...userWithoutPassword } = updatedUser;
    
            res.json({
                message: 'Profile updated successfully',
                user: userWithoutPassword
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message || 'Error updating profile'
            });
        }
    };

    getAllUsers = async (req: AuthRequest, res: Response) => {
        try {
            const users = await this.userService.getAllUsers();
            
            // Remove passwords from response
            const usersWithoutPasswords = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.json({ 
                users: usersWithoutPasswords 
            });
        } catch (error: any) {
            res.status(500).json({
                message: error.message || 'Error fetching users'
            });
        }
    };

    // New endpoints for role management
    addRole = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not found in request'
                });
            }

            const userId = req.user.id;
            const { role } = req.body;

            if (!role || !['buyer', 'seller'].includes(role)) {
                return res.status(400).json({
                    message: 'Invalid role specified'
                });
            }

            const updatedUser = await this.userService.updateUserRole(userId, role);
            
            // Remove password from response
            const { password, ...userWithoutPassword } = updatedUser;

            res.json({
                message: `Successfully added ${role} role`,
                user: userWithoutPassword
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message || `Error adding role`
            });
        }
    };

    getUserRoles = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'User not found in request'
                });
            }

            const userId = req.user.id;
            const user = await this.userService.getUserById(userId);

            res.json({
                roles: {
                    isBuyer: user.isBuyer,
                    isSeller: user.isSeller
                },
                buyerProfile: user.buyerProfile,
                sellerProfile: user.sellerProfile
            });
        } catch (error: any) {
            res.status(404).json({
                message: error.message || 'Error fetching user roles'
            });
        }
    };

    //Add this method to UserController class
    createSellerProfile = async (req: AuthRequest, res: Response) => {
        console.log('Creating seller profile:', {
            userId: req.user?.id,
            body: req.body
        });
        try {
            if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
            }

        const profileData: CreateSellerProfileDto = req.body;

        // Validate required fields
        if (!profileData.companyName) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const sellerProfile = await this.userService.createSellerProfile(
            req.user.id,
            profileData
        );

        res.status(201).json({
            message: 'Seller profile created successfully',
            sellerProfile
        });
    } catch (error: any) {
        res.status(400).json({ message: error?.message || 'Error creating seller profile' });
    }
};
}