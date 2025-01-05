import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user/index';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
    constructor(private userService: UserService) {}

    register = async (req: Request, res: Response) => {
        try {
            const createUserDto: CreateUserDto = req.body;
            const user = await this.userService.createUser(createUserDto);
            const token = this.userService.generateToken(user);

            res.status(201).json({
                message: 'User registered successfully',
                user,
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

            res.json({
                message: 'Login successful',
                user,
                token
            });
        } catch (error: any) {
            res.status(401).json({
                message: error.message || 'Invalid credentials'
            });
        }
    };

    getProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user.id;
            const user = await this.userService.getUserById(userId);
            
            res.json({
                user
            });
        } catch (error: any) {
            res.status(404).json({
                message: error.message || 'User not found'
            });
        }
    };

    updateProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user.id;
            const updateUserDto: UpdateUserDto = req.body as UpdateUserDto
            const updatedUser = await this.userService.updateUser(userId, updateUserDto);

            res.json({
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message || 'Error updating profile'
            });
        }
    };

    getAllUsers = async (req: AuthRequest, res: Response) => {
        try {
            // Only admin should access this route (add role middleware)
            const users = await this.userService.getAllUsers();
            res.json({ users });
        } catch (error: any) {
            res.status(500).json({
                message: error.message || 'Error fetching users'
            });
        }
    };
}