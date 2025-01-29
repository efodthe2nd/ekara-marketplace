import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { BuyerProfile } from "../entities/Buyer";
import { SellerProfile } from "../entities/SellerProfile";
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  CreateSellerProfileDto,
} from "../dto/user";
//import { CreateSellerProfileDto } from '../dto/user/CreateSellerProfileDto';

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private buyerProfileRepository: Repository<BuyerProfile>,
    private sellerProfileRepository: Repository<SellerProfile>
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, role, ...profileData } = createUserDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      isBuyer: role === "buyer",
      isSeller: role === "seller",
    });

    await this.userRepository.save(user);

    // Create profile based on role
    if (role === "buyer") {
      const buyerProfile = this.buyerProfileRepository.create({
        user,
        ...profileData,
      });
      await this.buyerProfileRepository.save(buyerProfile);
    } else if (role === "seller") {
      const sellerProfile = this.sellerProfileRepository.create({
        user,
        ...profileData,
      });
      await this.sellerProfileRepository.save(sellerProfile);
    }

    return this.getUserById(user.id);
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["buyerProfile", "sellerProfile"],
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        isBuyer: user.isBuyer,
        isSeller: user.isSeller,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
  }

  async updateUserRole(
    userId: number,
    newRole: "buyer" | "seller"
  ): Promise<User> {
    const user = await this.getUserById(userId);

    if (newRole === "buyer" && !user.isBuyer) {
      user.isBuyer = true;
      const buyerProfile = this.buyerProfileRepository.create({
        user,
      });
      await this.buyerProfileRepository.save(buyerProfile);
    } else if (newRole === "seller" && !user.isSeller) {
      user.isSeller = true;
      const sellerProfile = this.sellerProfileRepository.create({
        user,
      });
      await this.sellerProfileRepository.save(sellerProfile);
    }

    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ["buyerProfile", "sellerProfile"],
    });
  }

  // Add to UserService class
  async updateProfilePicture(userId: number, imageData: string): Promise<User> {
    try {
      // First get the user
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update the profile picture
      user.profilePicture = imageData;

      // Save and return the updated user
      const updatedUser = await this.userRepository.save(user);

      // Log to debug
      console.log("Profile picture updated:", {
        userId,
        hasProfilePicture: !!updatedUser.profilePicture,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
        where: { id },
        relations: {
            sellerProfile: true,
            buyerProfile: true
        },
        select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true,
            location: true,
            bio: true,
            isSeller: true,
            isBuyer: true,
            createdAt: true,
            updatedAt: true,
            sellerProfile: {
                id: true,
                companyName: true,
                companyDescription: true,
                website: true,
                rating: true,
                numReviews: true
            },
            buyerProfile: {
                id: true,
                // Add any necessary buyer profile fields
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

  // Add this method to UserService class
  async createSellerProfile(
    userId: number,
    profileData: CreateSellerProfileDto
  ): Promise<SellerProfile> {
    const user = await this.getUserById(userId);

    if (!user.isSeller) {
      throw new Error("User is not a seller");
    }

    let sellerProfile = await this.sellerProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (sellerProfile) {
      // Update existing profile
      Object.assign(sellerProfile, profileData);
      return await this.sellerProfileRepository.save(sellerProfile);
    }

    // Create new profile
    const newProfile = new SellerProfile();
    Object.assign(newProfile, {
      ...profileData,
      user,
    });

    return await this.sellerProfileRepository.save(newProfile);
  }
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.getUserById(userId);

    // Handle password update with verification
    if (updateUserDto.password && updateUserDto.currentPassword) {
      // First verify the current password
      const isPasswordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Only update password if current password was correct
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Rest of your existing update logic...
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.bio !== undefined) {
      user.bio = updateUserDto.bio;
    }

    // Update base user fields
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.bio !== undefined) {
      // Add this line to handle bio
      user.bio = updateUserDto.bio; // Even if it's empty string
    }

    // Update buyer profile if it exists
    if (user.isBuyer && user.buyerProfile) {
      if (updateUserDto.firstName)
        user.buyerProfile.firstName = updateUserDto.firstName;
      if (updateUserDto.lastName)
        user.buyerProfile.lastName = updateUserDto.lastName;
      if (updateUserDto.address)
        user.buyerProfile.address = updateUserDto.address;
      await this.buyerProfileRepository.save(user.buyerProfile);
    }

    // Update seller profile if it exists
    if (user.isSeller && user.sellerProfile) {
      if (updateUserDto.companyName)
        user.sellerProfile.companyName = updateUserDto.companyName;
      if (updateUserDto.companyDescription)
        user.sellerProfile.companyDescription =
          updateUserDto.companyDescription;
      if (updateUserDto.website)
        user.sellerProfile.website = updateUserDto.website;
      await this.sellerProfileRepository.save(user.sellerProfile);
    }

    return this.userRepository.save(user);
  }

  async updateLocation(userId: number, location: string): Promise<User> {
    const user = await this.getUserById(userId);
    user.location = location;
    return this.userRepository.save(user);
  }
}
