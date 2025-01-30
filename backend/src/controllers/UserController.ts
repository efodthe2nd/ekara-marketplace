import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, LoginUserDto, UpdateUserDto, CreateSellerProfileDto } from '../dto/user/index';
import { AuthRequest } from '../middleware/auth.middleware';
import { SellerProfile } from '../entities/SellerProfile';

//import { ProductService } from '../services/ProductService';

import { Repository } from 'typeorm';
import { User } from '../entities/User';

export class UserController {
    constructor(
        private userService: UserService,
        private userRepository: Repository<User>
    ) {}

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
            
            // Log to debug
            console.log('Getting profile:', {
                userId,
                hasProfilePicture: !!user.profilePicture
            });
            
            const { password, ...userWithoutPassword } = user;
           
            res.json({
                user: userWithoutPassword
            });
        } catch (error: any) {
            console.error('Error getting profile:', error);
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

    // getSellerProducts = async (req: AuthRequest, res: Response) => {
    //     try {
    //         const sellerId = parseInt(req.params.id);
    //         if (!sellerId) {
    //             return res.status(400).json({ message: 'Invalid seller ID' });
    //         }

    //         const products = await this.productService.getProductsBySellerId(sellerId);
    //         res.json(products);
    //     } catch (error: any) {
    //         console.error('Error fetching seller products:', error);
    //         res.status(500).json({
    //             message: error.message || 'Error fetching seller products'
    //         });
    //     }
    // };

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

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // Add this new method to your UserController class
  getUserPublicProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const user = await this.userService.getUserById(userId);
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Include all public profile information
        const publicProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            location: user.location,
            bio: user.bio,
            isSeller: user.isSeller,
            isBuyer: user.isBuyer,
            sellerProfile: user.sellerProfile ? {
                id: user.sellerProfile.id,
                companyName: user.sellerProfile.companyName,
                companyDescription: user.sellerProfile.companyDescription,
                website: user.sellerProfile.website,
                rating: user.sellerProfile.rating,
                numReviews: user.sellerProfile.numReviews
            } : null,
            buyerProfile: user.buyerProfile ? {
                id: user.buyerProfile.id,
                // Add any public buyer profile fields
            } : null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({ user: publicProfile });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

  uploadProfilePicture = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Upload request received:', {
            user: req.user?.id,
            bodyKeys: Object.keys(req.body)
        });

        if (!req.user || !req.body.profilePicture) {
            console.log('Missing data:', {
                hasUser: !!req.user,
                hasProfilePicture: !!req.body.profilePicture
            });
            return res.status(400).json({
                message: 'No user or profile picture provided'
            });
        }

        const userId = req.user.id;
        const base64Image = req.body.profilePicture;

        // Update user with new profile picture
        const updatedUser = await this.userService.updateProfilePicture(userId, base64Image);

        console.log('Profile picture updated successfully');

        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;

        res.json({
            message: 'Profile picture updated successfully',
            user: userWithoutPassword,
            profilePicUrl: base64Image
        });
    } catch (error: any) {
        console.error('Error in uploadProfilePicture:', error);
        res.status(400).json({
            message: error.message || 'Error uploading profile picture'
        });
    }
};
  
updateLocation = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(400).json({
                message: 'No user provided'
            });
        }
        const userId = req.user.id;
        const { location } = req.body;

        if (!location) {
            return res.status(400).json({
                message: 'Location is required'
            });
        }

        const updatedUser = await this.userService.updateLocation(userId, location);
        
        const { password, ...userWithoutPassword } = updatedUser;
        res.json({
            message: 'Location updated successfully',
            user: userWithoutPassword
        });
    } catch (error: any) {
        res.status(400).json({
            message: error.message || 'Error updating location'
        });
    }
};

getSellerProfile = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log('Attempting to fetch seller profile for userId:', userId);
      
      const sellerProfile = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.sellerProfile', 'sellerProfile')
        .where('user.id = :userId', { userId })
        .getOne();

      console.log('Query result:', sellerProfile); // Add this line
  
      if (!sellerProfile) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      if (!sellerProfile.sellerProfile) {
        console.log('Seller profile not found for user');
        return res.status(404).json({ message: 'Seller profile not found' });
      }
  
      const result = {
        sellerId: sellerProfile.sellerProfile.id,
        // Include other seller profile data as needed
      };
      console.log('Returning seller profile:', result);
      res.json(result);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
}
}