// src/services/UserService.ts
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, Buyer, Seller } from '../entities/Index';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user';

export class UserService {
    constructor(
        private userRepository: Repository<User>,
        private buyerRepository: Repository<Buyer>,
        private sellerRepository: Repository<Seller>
    ) {}

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async createUser(createUserDto: CreateUserDto) {
        const { email, username, password, role } = createUserDto;
        
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({ 
            where: [{ email }, { username }] 
        });
        
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        if (role === 'buyer') {
            const buyer = this.buyerRepository.create({
                email,
                username,
                password: hashedPassword,
                role,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                address: createUserDto.address,
            });
            return this.buyerRepository.save(buyer);
        } else {
            const seller = this.sellerRepository.create({
                email,
                username,
                password: hashedPassword,
                role,
                companyName: createUserDto.companyName,
                companyDescription: createUserDto.companyDescription,
                website: createUserDto.website,
            });
            return this.sellerRepository.save(seller);
        }
    }

    async validateUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    generateToken(user: User) {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            throw new Error('User not found');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await this.hashPassword(updateUserDto.password);
        }

        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async getUserById(userId: number) {
      const user = await this.userRepository.findOne({ 
          where: { id: userId } 
      });
      
      if (!user) {
          throw new Error('User not found');
      }
      
      return user;
  }
  
  async getAllUsers() {
      return this.userRepository.find({
          select: ['id', 'email', 'username', 'role', 'createdAt'] // Exclude sensitive data
      });
  }
}